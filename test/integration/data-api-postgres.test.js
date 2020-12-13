const { expect } = require('chai');

const { postgres } = require('./knexClient');
const commonTests = require('./common-tests');
const { migrateToLatest } = require('./migrations-test');

let counter = 0;

// test('Connection', async () => {
//   const test = await knex.raw('select 1+1 as result');
//   expect(test.records[0].result).toBe(2);
// });

describe('data-api-postgres', () => {
  before(async () => {
    console.log('Before');

    const tables = await postgres
      .select('table_name')
      .from('information_schema.tables')
      .where({ table_schema: 'public' });

    const tableNames = tables.map((table) => table.table_name);

    for (let i = 0; i < tableNames.length; i++) {
      const tableName = tableNames[tableNames.length - i - 1];
      console.log(`Drop table ${tableName}`);
      await postgres.raw(`DROP TABLE "${tableName}" CASCADE`);
    }
  });

  it('should create a test table', async () => {
    await commonTests.createATestTable(postgres);
  });

  describe('insert', () => {
    it('should insert a row', async () => {
      await commonTests.insertRowAndFetch(postgres);
    });

    it('should insert a row and fetch the result', async () => {
      await commonTests.insertRowAndFetch(postgres);
    });

    it('should insert a row with timestamp as null', async () => {
      await commonTests.insertRowWithTimestampAsNull(postgres);
    });

    it('should insert two rows in a transaction', async () => {
      await commonTests.insertTwoRowsInTransaction(postgres);
    });
  });

  describe('update', () => {
    it('should update a row', async () => {
      await commonTests.updateARow(postgres);
    });

    it('should update a row and return the results', async () => {
      await commonTests.updateARowReturning(postgres);
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

    it('should query for a json array field', async () => {
      await commonTests.queryForAJSONArrayField(postgres);
    });

    it('should query for a single jsonb field', async () => {
      await commonTests.queryForASingleJSONBField(postgres);
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

  it('should insert a row and return an array of ids', async () => {
    const tableName = 'test-' + counter++;

    await postgres.schema.createTable(tableName, (table) => {
      table.increments();
      table.string('value');
    });

    const rows = await postgres.table(tableName).insert({ value: 'test' }).returning('id');

    expect(rows.length).to.equal(1);
    expect(rows[0]).to.equal(1);
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

  describe('knex-migrate', function () {
    it('should setup a database with knex-migrate', async function () {
      await migrateToLatest('test/integration/knexFiles/postgres.js');
    });
  });
});
