const { expect } = require('chai');

const { postgres } = require('./knexClient');

let counter = 0;

// test('Connection', async () => {
//   const test = await knex.raw('select 1+1 as result');
//   expect(test.records[0].result).toBe(2);
// });

describe('data-api-postgress', () => {
  before(async () => {
    const tables = await postgres
      .select('table_name')
      .from('information_schema.tables')
      .where({ table_schema: 'public' });

    const tableNames = tables.map((table) => table.table_name);

    for (let i = 0; i < tableNames.length; i++) {
      const tableName = tableNames[tableNames.length - i - 1];
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

  describe('insert', () => {
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

  describe('whereIn', () => {
    it('should insert a row and fetch the result', async () => {
      const tableName = 'test-' + counter++;

      await postgres.schema.createTable(tableName, (table) => {
        table.increments();
        table.string('value');
      });

      await postgres.table(tableName).insert({ value: 'test1' });
      await postgres.table(tableName).insert({ value: 'test2' });

      const rows = await postgres.select().from(tableName).whereIn('value', ['test1', 'test2']);

      expect(rows.length).to.equal(2);
    });
  });

  describe('errors', () => {
    it('should return an error for a invalid insert', async () => {
      const tableName = 'test-' + counter++;

      await postgres.schema.createTable(tableName, (table) => {
        table.increments();
        table.string('value');
      });

      let _err;

      try {
        await postgres.table(tableName).insert({ non_existing_colun: 'test' }).returning('*');
      } catch (err) {
        _err = err;
      }

      expect(_err.message).to.contain('column "non_existing_colun" of');
    });

    it('should return an error for a invalid select', async () => {
      let _err;

      try {
        const response = await postgres.raw('select sadfasdfasdfasdf;');
      } catch (err) {
        _err = err;
      }

      expect(_err.message).to.contain('column "sadfasdfasdfasdf" does not exist');
    });
  });

  describe('join', () => {
    it('should query two tables with an inner join', async () => {
      const tableName1 = 'test-' + counter++;
      const tableName2 = 'test-' + counter++;

      await postgres.schema.createTable(tableName1, (table) => {
        table.increments();
        table.string('value1');
      });

      await postgres.schema.createTable(tableName2, (table) => {
        table.increments();
        table.integer('table1_id');
        table.string('value2');

        table.foreign('table1_id').references('id').inTable(tableName1);
      });

      const response = await postgres.table(tableName1).insert({ value1: 'test1' }).returning('*');

      await postgres.table(tableName2).insert({ value2: 'test2', table1_id: response[0].id });

      const rows = await postgres
        .select()
        .from(tableName1)
        .innerJoin(tableName2, `${tableName1}.id`, `${tableName2}.table1_id`);

      console.log('Response: ' + JSON.stringify(rows));

      expect(rows.length).to.equal(1);
      expect(rows[0].value2).to.equal('test2');
    });
  });
});
