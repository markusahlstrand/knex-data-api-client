const { expect } = require('chai');

const { postgres } = require('./knexClient');

let counter = 0;

// test('Connection', async () => {
//   const test = await knex.raw('select 1+1 as result');
//   expect(test.records[0].result).toBe(2);
// });

// test('Failed query', async () => {
//   expect(knex.raw('select sadfasdfasdfasdf;')).rejects.toThrow('Unknown');
// });

describe('data-api-postgress', () => {
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

    const actual = await postgres
      .table(tableName)
      .insert({ value: 'test' })
      .returning('*');

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
    const tableName = 'test-' + counter++;

    await postgres.schema.createTable(tableName, (table) => {
      table.increments();
      table.string('value');
    });

    try {
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
    } catch (err) {
      console.error(err);
    }

    const rows = await postgres.select().from(tableName);

    expect(rows.length).to.equal(2);
  });
});
