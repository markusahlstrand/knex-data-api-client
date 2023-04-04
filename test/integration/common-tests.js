const { expect } = require('chai');

let counter = 0;

async function hasTableReturnsFalse(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  const exists = await knex.schema.hasTable(tableName);

  expect(exists).to.equal(false);
}

async function deleteARowReturnsTheNumberOfRecords(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.string('value');
  });

  await knex.table(tableName).insert({ value: 'test' });

  const updatedRows = await knex(tableName).where({ value: 'test' }).del();

  expect(updatedRows).to.equal(1);
}

async function hasTableReturnsTrue(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.string('value');
  });

  const exists = await knex.schema.hasTable(tableName);

  expect(exists).to.equal(true);
}

async function createATestTable(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.string('name');
    table.integer('batch');
    table.datetime('migration_time');
  });

  const rows = await knex
    .select('table_name')
    .from('information_schema.tables')
    .where({ table_name: tableName });

  expect(rows.length).to.equal(1);
}

async function queryForASingleField(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.string('value');
  });

  await knex.table(tableName).insert({ value: 'test' });

  const rows = await knex.select('value').from(tableName);

  expect(rows.length).to.equal(1);
  expect(rows[0].value).to.equal('test');
}

async function queryForFirst(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.string('value');
  });

  await knex.table(tableName).insert({ value: 'test' });

  const row = await knex.first('value').from(tableName);
  expect(row).to.be.an('object');
  expect(row.value).to.equal('test');
}

async function queryForFirstUndefined(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.string('value');
  });

  const row = await knex.first('value').from(tableName);
  expect(row).to.be.an('undefined');
}

async function queryForATimestampField(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.timestamp('date');
  });

  const date = new Date('2021-10-06T07:13:40.917Z');

  await knex.table(tableName).insert({ date });

  const rows = await knex.select('date').from(tableName);

  expect(rows.length).to.equal(1);

  expect(Object.prototype.toString.call(rows[0].date)).to.equal('[object Date]');
  expect(rows[0].date.toISOString()).to.equal(date.toISOString());
}

async function queryForATruncatedTimestampField(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.timestamp('date');
  });

  // It is saved correctly in DB, but SQL command select will retrieve as : 2021-10-07 12:56:16.18
  const date = new Date('2021-10-07T12:56:16.180Z');

  await knex.table(tableName).insert({ date });

  const rows = await knex.select('date').from(tableName);

  expect(rows.length).to.equal(1);

  expect(Object.prototype.toString.call(rows[0].date)).to.equal('[object Date]');
  expect(rows[0].date.toISOString()).to.equal(date.toISOString());
}

/**
 * Infinity values in timestamp field is only supported in PostgreSQL.
 */
async function queryForAInfinityTimestampField(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.timestamp('date');
  });

  await knex.table(tableName).insert({ date: Infinity });
  await knex.table(tableName).insert({ date: -Infinity });
  await knex.table(tableName).insert({ date: 'infinity' });
  await knex.table(tableName).insert({ date: '-infinity' });

  const rows = await knex.select('date').from(tableName);

  expect(rows.length).to.equal(4);

  expect(rows[0].date).to.equal(Infinity);
  expect(rows[1].date).to.equal(-Infinity);
  expect(rows[2].date).to.equal(Infinity);
  expect(rows[3].date).to.equal(-Infinity);
}

async function queryForASingleJSONField(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.json('value');
  });

  await knex.table(tableName).insert({ value: { foo: 'bar' } });

  const rows = await knex.select('value').from(tableName);

  expect(rows.length).to.equal(1);
  expect(rows[0].value.foo).to.equal('bar');
}

async function queryForASingleJSONBField(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.jsonb('value');
  });

  await knex.table(tableName).insert({ value: { foo: 'bar' } });

  const rows = await knex.select('value').from(tableName);

  expect(rows.length).to.equal(1);
  expect(rows[0].value.foo).to.equal('bar');
}

async function queryForAJSONArrayField(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.json('value');
  });

  // Need to stringify.. http://knexjs.org/#Schema-json
  await knex.table(tableName).insert({ value: JSON.stringify(['bar']) });

  const rows = await knex.select('value').from(tableName);

  expect(rows.length).to.equal(1);
  expect(rows[0].value[0]).to.equal('bar');
}

async function queryTwoTablesWithAnInnerJoin(knex) {
  const tableName1 = `common_test_${counter}`;
  counter += 1;
  const tableName2 = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName1, (table) => {
    table.increments();
    table.string('value1');
  });

  await knex.schema.createTable(tableName2, (table) => {
    table.increments();
    table.integer('table1_id').unsigned();
    table.string('value2');

    table.foreign('table1_id').references('id').inTable(tableName1);
  });

  await knex.table(tableName1).insert({ value1: 'test1' }).returning('*');

  // Mysql doesn't return the id of the created entity
  await knex.table(tableName2).insert({ value2: 'test2', table1_id: 1 });

  const rows = await knex
    .select()
    .from(tableName1)
    .innerJoin(tableName2, `${tableName1}.id`, `${tableName2}.table1_id`);

  expect(rows.length).to.equal(1);
  expect(rows[0].value2).to.equal('test2');
}

async function returnAnErrorForInvalidInsert(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.string('value');
  });

  try {
    await knex.table(tableName).insert({ non_existing_colun: 'test' }).returning('*');
    throw new Error('should throw');
  } catch (err) {
    expect(err.message).to.contain('column "non_existing_colun" of');
  }
}

async function returnAnErrorForInvalidSelect(knex) {
  try {
    await knex.raw('select sadfasdfasdfasdf;');
    throw new Error('should throw');
  } catch (err) {
    expect(err.message).to.contain('column "sadfasdfasdfasdf" does not exist');
  }
}

async function fetchToRowsUsingWhereIn(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.string('value');
  });

  await knex.table(tableName).insert({ value: 'test1' });
  await knex.table(tableName).insert({ value: 'test2' });

  const rows = await knex.select().from(tableName).whereIn('value', ['test1', 'test2']);

  expect(rows.length).to.equal(2);
}

async function fetchToRowsUsingWhereInWithNumbers(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.integer('value');
  });

  await knex.table(tableName).insert({ value: 1 });
  await knex.table(tableName).insert({ value: 2 });
  await knex.table(tableName).insert({ value: 3 });

  const rows = await knex.select().from(tableName).whereIn('value', [1, 2]);

  expect(rows.length).to.equal(2);
}

async function insertRowAndFetch(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.string('value');
  });

  await knex.table(tableName).insert({ value: 'test' });

  const rows = await knex.select().from(tableName);

  expect(rows.length).to.equal(1);
}

async function insertRowWithJsonbAndReturnAnArrayOfRows(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.jsonb('payload');
  });

  const payload = { name: 'moi', location: 'sydney' };
  const rows = await knex.table(tableName).insert({ payload }).returning('*');

  expect(rows.length).to.equal(1);
  expect(rows[0]).to.deep.equal({ id: 1, payload });
}

async function insertRowAndReturnAnArrayOfRows(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.string('value');
  });

  const rows = await knex.table(tableName).insert({ value: 'test' }).returning('id');

  expect(rows.length).to.equal(1);
  expect(rows[0]).to.deep.equal({ id: 1 });
}

async function insertRowWithTimestampAsNull(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.timestamp('value');
  });

  const response = await knex.table(tableName).insert({ value: null }).returning('*');

  expect(response.length).to.equal(1);
}

async function insertTwoRowsInTransaction(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.string('value');
  });

  try {
    await knex
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

  const rows = await knex.select().from(tableName);

  expect(rows.length).to.equal(2);
}

async function updateARow(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.string('value');
  });

  await knex.table(tableName).insert({ value: 'test' });

  const updatedRows = await knex(tableName).update({ value: 'update' }).where({ value: 'test' });

  const rows = await knex.select('value').from(tableName);

  expect(updatedRows).to.equal(1);
  expect(rows.length).to.equal(1);
  expect(rows[0].value).to.equal('update');
}

async function updateARowReturning(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.string('value');
  });

  await knex.table(tableName).insert({ value: 'test' });

  const rows = await knex(tableName)
    .update({ value: 'update' })
    .where({ value: 'test' })
    .returning('*');

  expect(rows.length).to.equal(1);
  expect(rows[0].value).to.equal('update');
}

async function updateRowWithJsonbReturning(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.jsonb('value');
  });

  await knex.table(tableName).insert({ value: { test: 'one' } });

  const rows = await knex(tableName)
    .update({ value: { test: 'update' } })
    .returning('*');

  expect(rows.length).to.equal(1);
  expect(typeof rows[0].value).to.equal('object');
  expect(rows[0].value).to.deep.equal({ test: 'update' });
}

async function returnEmptyArrayForQueryOnEmptyTable(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.string('value');
  });
  const rows = await knex.select('value').from(tableName).orderBy('id', 'asc');

  expect(rows.length).to.equal(0);
}

async function insertTextArray(knex) {
  const tableName = `common_test_${counter}`;
  counter += 1;

  await knex.schema.createTable(tableName, (table) => {
    table.increments();
    table.specificType('value', 'text ARRAY');
  });

  await knex.table(tableName).insert({ value: '{test}' });

  const [row] = await knex.select().from(tableName);

  expect(row.value).to.deep.equal(['test']);
}

module.exports = {
  createATestTable,
  deleteARowReturnsTheNumberOfRecords,
  fetchToRowsUsingWhereIn,
  fetchToRowsUsingWhereInWithNumbers,
  hasTableReturnsFalse,
  hasTableReturnsTrue,
  insertRowAndFetch,
  insertRowAndReturnAnArrayOfRows,
  insertRowWithJsonbAndReturnAnArrayOfRows,
  insertRowWithTimestampAsNull,
  insertTextArray,
  insertTwoRowsInTransaction,
  queryForASingleField,
  queryForFirst,
  queryForFirstUndefined,
  queryForASingleJSONField,
  queryForASingleJSONBField,
  queryForATimestampField,
  queryForATruncatedTimestampField,
  queryForAInfinityTimestampField,
  queryForAJSONArrayField,
  queryTwoTablesWithAnInnerJoin,
  returnAnErrorForInvalidInsert,
  returnAnErrorForInvalidSelect,
  returnEmptyArrayForQueryOnEmptyTable,
  updateARow,
  updateARowReturning,
  updateRowWithJsonbReturning,
};
