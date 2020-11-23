exports.up = async (knex) => {
  await knex.schema.createTable('users', (table) => {
    table.string('firstname');
    table.string('lastname');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('users');
};
