exports.up = async (knex) => {
  await knex.schema.table('users', async (table) => {
    await table.string('email');
  });
};

exports.down = async (knex) => {
  await knex.schema.table('users', async (table) => {
    await table.dropColumn('email');
  });
};
