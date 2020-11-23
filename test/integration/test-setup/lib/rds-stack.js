const cdk = require('@aws-cdk/core');
const rds = require('@aws-cdk/aws-rds');
const ec2 = require('@aws-cdk/aws-ec2');

class RdsStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'TestVpc', {
      cidr: '10.0.0.0/16',
      natGateways: 0,
      subnetConfiguration: [{ name: 'test_aurora_isolated_', subnetType: ec2.SubnetType.ISOLATED }],
    });

    const subnetIds = vpc.isolatedSubnets.map((subnet) => subnet.subnetId);

    const dbSubnetGroup = new rds.CfnDBSubnetGroup(this, 'TestAuroraSubnetGroup', {
      dbSubnetGroupDescription: 'Subnet group to access aurora',
      dbSubnetGroupName: 'test-aurora-serverless-subnet-group',
      subnetIds,
    });

    const secret = new rds.DatabaseSecret(this, 'PostgresTestMasterUserSecret', {
      username: 'root',
      secretName: 'test-cluster',
    });

    const postgres = new rds.CfnDBCluster(this, 'PostgresTestAuroraServerless', {
      databaseName: 'Test',
      dbClusterIdentifier: 'postgres-test-cluster',
      engine: 'aurora-postgresql',
      engineMode: 'serverless',

      masterUsername: secret.secretValueFromJson('username').toString(),
      masterUserPassword: secret.secretValueFromJson('password').toString(),
      dbSubnetGroupName: dbSubnetGroup.dbSubnetGroupName,
      scalingConfiguration: {
        autoPause: true,
        maxCapacity: 2,
        minCapacity: 2, // 2 is minimum value..
        secondsUntilAutoPause: 3600,
      },
    });

    postgres.addDependsOn(dbSubnetGroup);

    const mysql = new rds.CfnDBCluster(this, 'MysqlTestAuroraServerless', {
      databaseName: 'Test',
      dbClusterIdentifier: 'mysql-test-cluster',
      engine: 'aurora',
      engineMode: 'serverless',

      masterUsername: secret.secretValueFromJson('username').toString(),
      masterUserPassword: secret.secretValueFromJson('password').toString(),
      dbSubnetGroupName: dbSubnetGroup.dbSubnetGroupName,
      scalingConfiguration: {
        autoPause: true,
        maxCapacity: 2,
        minCapacity: 2, // 2 is minimum value..
        secondsUntilAutoPause: 3600,
      },
    });

    mysql.addDependsOn(dbSubnetGroup);
  }
}

module.exports = { RdsStack };
