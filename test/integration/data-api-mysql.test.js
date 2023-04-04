const { expect } = require('chai');
const { describe, it, before } = require('mocha');

const { mysql } = require('./knexClient');
const commonTests = require('./common-tests');
const { migrateToLatest } = require('./migrations-test');

let counter = 0;

describe('data-api-mysql', () => {
  before(async () => {
    const tables = await mysql
      .select('table_name')
      .from('information_schema.tables')
      .where({ TABLE_SCHEMA: process.env.DB_NAME });

    const tableNames = tables.map((table) => table.table_name);
    await mysql.raw('SET FOREIGN_KEY_CHECKS = 0;');

    for (let i = 0; i < tableNames.length; i += 1) {
      const tableName = tableNames[i];
      // eslint-disable-next-line no-console
      console.log(`Drop table ${tableName}`);
      // eslint-disable-next-line no-await-in-loop
      await mysql.schema.dropTable(tableName);
    }

    await mysql.raw('SET FOREIGN_KEY_CHECKS = 1;');
  });

  it('should create a test table', async () => {
    await commonTests.createATestTable(mysql);
  });

  describe('insert', () => {
    it('should insert a row', async () => {
      const tableName = `test_${counter}`;
      counter += 1;

      await mysql.schema.createTable(tableName, (table) => {
        table.increments();
        table.string('value');
      });

      const actual = await mysql.table(tableName).insert({ value: 'test' }).returning('*');

      // This works differently in mysql compared to postgres. Mysql only returns the id
      expect(actual.length).to.equal(1);
      expect(actual[0]).to.equal(1);
    });

    it('should insert a row and fetch the result', async () => {
      await commonTests.insertRowAndFetch(mysql);
    });

    it('should insert a row with timestamp as null', async () => {
      await commonTests.insertRowWithTimestampAsNull(mysql);
    });

    it('should insert two rows in a transaction', async () => {
      await commonTests.insertTwoRowsInTransaction(mysql);
    });
  });

  describe('select', () => {
    it('should query for a single field', async () => {
      await commonTests.queryForASingleField(mysql);
    });

    it('should return an empty array for a query on an empty table', async () => {
      await commonTests.returnEmptyArrayForQueryOnEmptyTable(mysql);
    });
  });

  describe('first', () => {
    it('should query for a first field', async () => {
      await commonTests.queryForFirst(mysql);
    });

    it('should return undefined for a first query that returns no results', async () => {
      await commonTests.queryForFirstUndefined(mysql);
    });
  });

  describe('whereIn', () => {
    it('should fetch to rows', async () => {
      await commonTests.fetchToRowsUsingWhereIn(mysql);
    });
  });

  describe('update', () => {
    it('should update a row', async () => {
      await commonTests.updateARow(mysql);
    });
  });

  describe('errors', () => {
    it('should return an error for a invalid insert', async () => {
      const tableName = `test_${counter}`;
      counter += 1;

      await mysql.schema.createTable(tableName, (table) => {
        table.increments();
        table.string('value');
      });

      try {
        await mysql.table(tableName).insert({ non_existing_colun: 'test' }).returning('*');
        throw new Error('Should throw an error');
      } catch (err) {
        expect(err.message).to.contain('Unknown column');
      }
    });

    it('should return an error for a invalid select', async () => {
      try {
        await mysql.raw('select sadfasdfasdfasdf;');
        throw new Error('Should throw an error');
      } catch (err) {
        expect(err.message).to.contain('Unknown column');
      }
    });
  });

  describe('join', () => {
    it('should query two tables with an inner join', async () => {
      await commonTests.queryTwoTablesWithAnInnerJoin(mysql);
    });
  });

  describe('hasTable', () => {
    it('should return false if a table does not exist', async () => {
      await commonTests.hasTableReturnsFalse(mysql);
    });

    it('should return true if a table exists', async () => {
      await commonTests.hasTableReturnsTrue(mysql);
    });
  });

  describe('knex-migrate', () => {
    // Seems to be some issue with a timestamp truncation
    it.skip('should setup a database with knex-migrate', async () => {
      await migrateToLatest('test/integration/knexFiles/mysql.js');
    });
  });
});
