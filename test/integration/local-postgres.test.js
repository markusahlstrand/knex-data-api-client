require('dotenv').config();
const { describe, it, before } = require('mocha');

const postgres = require('knex')({
  client: 'pg',
  connection: process.env.LOCAL_POSTGRES_CONNECTION || 'postgres://localhost',
});

const commonTests = require('./common-tests');
const { migrateToLatest } = require('./migrations-test');

describe('postgres', () => {
  before(async () => {
    const tables = await postgres
      .select('table_name')
      .from('information_schema.tables')
      .where({ table_schema: 'public' })
      .orderBy('table_name', 'desc');

    const tableNames = tables.map((table) => table.table_name);

    for (let i = 0; i < tableNames.length; i += 1) {
      const tableName = tableNames[i];
      // eslint-disable-next-line no-console
      console.log(`Drop table ${tableName}`);
      // eslint-disable-next-line no-await-in-loop
      await postgres.raw(`DROP TABLE "${tableName}" CASCADE`);
    }
  });

  // after((done) => {
  //   postgres.destroy(done);
  // });

  it('should create a test table', async () => {
    await commonTests.createATestTable(postgres);
  });

  describe('inserts', () => {
    it('should insert a row', async () => {
      await commonTests.insertRowAndFetch(postgres);
    });

    it('should insert a row and fetch the result', async () => {
      await commonTests.insertRowAndFetch(postgres);
    });

    it('should insert a row with jsonb and fetch the result with types applied', async () => {
      await commonTests.insertRowWithJsonbAndReturnAnArrayOfRows(postgres);
    });

    it('should insert a row with timestamp as null', async () => {
      await commonTests.insertRowWithTimestampAsNull(postgres);
    });

    it('should insert two rows in a transaction', async () => {
      await commonTests.insertTwoRowsInTransaction(postgres);
    });

    it('should insert a text array value', async () => {
      await commonTests.insertTextArray(postgres);
    });

    it('should insert a row and return an array of rows', async () => {
      await commonTests.insertRowAndReturnAnArrayOfRows(postgres);
    });
  });

  describe('select', () => {
    it('should query for a single field', async () => {
      await commonTests.queryForASingleField(postgres);
    });

    it('should return an empty array for a query on an empty table', async () => {
      await commonTests.returnEmptyArrayForQueryOnEmptyTable(postgres);
    });

    it('should query for a single json field', async () => {
      await commonTests.queryForASingleJSONField(postgres);
    });

    it('should query for a timestamp field', async () => {
      await commonTests.queryForATimestampField(postgres);
    });

    it('should query for a timestamp field that truncates trailing zeros in milliseconds', async () => {
      await commonTests.queryForATruncatedTimestampField(postgres);
    });

    it('should query for a timestamp field that has Infinity value', async () => {
      await commonTests.queryForAInfinityTimestampField(postgres);
    });

    it('should query for a json array field', async () => {
      await commonTests.queryForAJSONArrayField(postgres);
    });

    it('should query for a single jsonb field', async () => {
      await commonTests.queryForASingleJSONBField(postgres);
    });
  });

  describe('first', () => {
    it('should query for a first field', async () => {
      await commonTests.queryForFirst(postgres);
    });

    it('should return undefined for a first query that returns no results', async () => {
      await commonTests.queryForFirstUndefined(postgres);
    });
  });

  describe('update', () => {
    it('should update a row', async () => {
      await commonTests.updateARow(postgres);
    });

    it('should update a row and return the results', async () => {
      await commonTests.updateARowReturning(postgres);
    });

    it('should update a row with jsonb and return the results with types applied', async () => {
      await commonTests.updateRowWithJsonbReturning(postgres);
    });
  });

  describe('whereIn', () => {
    it('should fetch to rows', async () => {
      await commonTests.fetchToRowsUsingWhereIn(postgres);
    });

    it('should fetch to rows with numbers', async () => {
      await commonTests.fetchToRowsUsingWhereInWithNumbers(postgres);
    });
  });

  describe('errors', () => {
    it('should return an error for a invalid insert', async () => {
      await commonTests.returnAnErrorForInvalidInsert(postgres);
    });

    it('should return an error for a invalid select', async () => {
      await commonTests.returnAnErrorForInvalidSelect(postgres);
    });
  });

  describe('join', () => {
    it('should query two tables with an inner join', async () => {
      await commonTests.queryTwoTablesWithAnInnerJoin(postgres);
    });
  });

  describe('hasTable', () => {
    it('should return false if a table does not exist', async () => {
      await commonTests.hasTableReturnsFalse(postgres);
    });

    it('should return true if a table exists', async () => {
      await commonTests.hasTableReturnsTrue(postgres);
    });
  });

  describe('delete', () => {
    it('shold delete a row and return the count', async () => {
      await commonTests.deleteARowReturnsTheNumberOfRecords(postgres);
    });
  });

  describe('knex-migrate', () => {
    it('should setup a database with knex-migrate', async function () {
      this.timeout(100000);

      await migrateToLatest('test/integration/knexFiles/local-postgres.js');
    });
  });
});
