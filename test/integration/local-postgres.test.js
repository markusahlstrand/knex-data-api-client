const { expect } = require('chai');

const postgres = require('knex')({
  client: 'pg',
  connection: 'postgres://localhost/test',
});

let counter = 0;

describe('postgres', () => {
  before(async () => {
    const tables = await postgres
      .select('table_name')
      .from('information_schema.tables')
      .where({ table_schema: 'public' });

    const tableNames = tables.map((table) => table.table_name);

    for (let i = 0; i < tableNames.length; i++) {
      const tableName = tableNames[i];
      console.log(`Drop table ${tableName}`);
      await postgres.schema.dropTable(tableName);
    }
  });

  after((done) => {
    postgres.destroy(done);
  });

  it('should create a test table', async () => {
    const tableName = 'test-' + counter++;

    await postgres.schema.createTable(tableName, (table) => {
      table.increments();
      table.string('value');
    });

    const rows = await postgres
      .select('table_name')
      .from('information_schema.tables')
      .where({ table_name: tableName });

    expect(rows.length).to.equal(1);
  });

  it('should insert a row', async () => {
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
    const tableName = 'test-' + counter++;

    await postgres.schema.createTable(tableName, (table) => {
      table.increments();
      table.string('value');
    });

    await postgres
      .transaction(async (trx) => {
        await trx.table(tableName).insert({ value: 'Test1' });
        await trx.table(tableName).insert({ value: 'Test2' });
      })
      .then(() => {
        console.log('Transaction complete.');
      })
      .catch((err) => {
        console.error(err);
      });

    const rows = await postgres.select().from(tableName);

    expect(rows.length).to.equal(2);
  });
});
