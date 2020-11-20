// const knexFactory = require('knex');
// const knexDataApiClient = require('../../index');
// const sqlstring = require('../../src/sqlstring');
// const constants = require('../../src/constants');

// const { expect } = require('chai');

// describe('mysql', () => {
//   it('should create a mysql query', async () => {
//     const knex = knexFactory({
//       client: knexDataApiClient.mysql,
//       connection: {
//         secretArn: '',
//         resourceArn: '',
//         database: '',
//         region: '',
//         dialect: 'mysql',
//       },
//     });

//     const query = knex.select('*').from('test').toString();
//     expect(query).to.equal('select * from `test`');
//   });

//   it('should replace the bindings', () => {
//     const query = sqlstring.format(
//       'select * from ? where "foo" = ?',
//       ['test', 'bar'],
//       constants.dialects.mysql,
//     );

//     expect(query).to.equal("select * from 'test' where \"foo\" = 'bar'");
//   });
// });

// describe('Postgres', () => {
//   it('should return a simple query', async () => {
//     const knex = knexFactory({
//       client: knexDataApiClient.postgres,
//       connection: {
//         secretArn: '',
//         resourceArn: '',
//         database: '',
//         region: '',
//         dialect: 'postgres',
//       },
//     });

//     const query = knex.select('*').from('test').toString();
//     expect(query).to.equal('select * from "test"');
//   });

//   it('should return a query with params', async () => {
//     const knex = knexFactory({
//       client: knexDataApiClient.postgres,
//       connection: {
//         secretArn: '',
//         resourceArn: '',
//         database: '',
//         region: '',
//         dialect: 'postgres',
//       },
//     });

//     const query = knex.select('*').from('test').where({ foo: 'bar' }).toString();
//     expect(query).to.equal('select * from "test" where "foo" = \'bar\'');
//   });

//   it('should replace the bindings', () => {
//     const query = sqlstring.format(
//       'select * from "test" where "foo" = $1',
//       ['bar'],
//       constants.dialects.postgres,
//     );

//     expect(query).to.equal('select * from "test" where "foo" = \'bar\'');
//   });

//   it('should insert null values correctly', () => {
//     const query = sqlstring.format(
//       'INSERT INTO table(number1,number2) VALUES (1,$1);',
//       [null],
//       constants.dialects.postgres,
//     );

//     expect(query).to.equal('INSERT INTO table(number1,number2) VALUES (1,NULL);');
//   });

//   it('should insert values with $ correctly', () => {
//     const query = sqlstring.format(
//       'INSERT INTO table(number1,number2) VALUES (1,"$1");',
//       [],
//       constants.dialects.postgres,
//     );

//     expect(query).to.equal('INSERT INTO table(number1,number2) VALUES (1,"$1");');
//   });
// });
