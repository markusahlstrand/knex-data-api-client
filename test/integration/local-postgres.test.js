const { expect } = require('chai');

const commonTests = require('./common-tests');
const { migrateToLatest } = require('./migrations-test');

const postgres = require('knex')({
  client: 'pg',
  connection: 'postgres://localhost',
});

let counter = 0;

describe('postgres', () => {
  before(async () => {
    const tables = await postgres
      .select('table_name')
      .from('information_schema.tables')
      .where({ table_schema: 'public' })
      .orderBy('table_name', 'desc');

    const tableNames = tables.map((table) => table.table_name);

    for (let i = 0; i < tableNames.length; i++) {
      const tableName = tableNames[i];
      console.log(`Drop table ${tableName}`);
      await postgres.raw(`DROP TABLE "${tableName}" CASCADE`);
    }
  });

  after((done) => {
    postgres.destroy(done);
  });

  it('should create a test table', async () => {
    await commonTests.createATestTable(postgres);
  });

  describe('inserts', () => {
    it('should insert a row', async () => {
      const tableName = 'test-' + counter++;

      await postgres.schema.createTable(tableName, (table) => {
        table.increments();
        table.string('value');
      });

      const actual = await postgres.table(tableName).insert({ value: 'test' }).returning('*');

      expect(actual.length).to.equal(1);
      expect(actual[0].id).to.exist;
      expect(actual[0].value).to.equal('test');
    });

    it('should insert a row and fetch the result', async () => {
      const tableName = 'test-' + counter++;

      await postgres.schema.createTable(tableName, (table) => {
        table.increments();
        table.string('value');
      });

      await postgres.table(tableName).insert({ value: 'test' });

      const rows = await postgres.select().from(tableName);

      expect(rows.length).to.equal(1);
    });

    it('should insert two rows in a transaction', async () => {
      await commonTests.insertTwoRowsInTransaction(postgres);
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

  describe('update', () => {
    it('should update a row', async () => {
      await commonTests.updateARow(postgres);
    });

    it('should update a row and return the results', async () => {
      await commonTests.updateARowReturning(postgres);
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

  describe('knex-migrate', () => {
    it('should setup a database with knex-migrate', async function () {
      this.timeout(100000);

      await migrateToLatest('test/integration/knexFiles/local-postgres.js');
    });
  });
});
