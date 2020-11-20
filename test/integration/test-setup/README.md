This folder contains CDK scritps to setup the mysql and postgres aurora databases.

Once the databases are created, there unfortunately are a few manual steps.
First the data-api needs to be enabled in the console.
Then fetch the ARN for the secrets and the clusters and add them to a env-file:

POSGRES_DB_SECRET_ARN=arn:aws:secretsmanager:<region>:<accountId>:secret:<SecretName>
POSTGRES_DB_CLUSTER_ARN=arn:aws:rds:<region>:<accountId>:cluster:test-postgres-cluster
MYSQL_DB_SECRET_ARN=arn:aws:secretsmanager:<region>:<accountId>:secret:<SecretName>
MYSQL_DB_CLUSTER_ARN=arn:aws:rds:<region>:<accountId>:cluster:test-mysql-cluster
DB_NAME=test
DB_REGION=eu-west-1
