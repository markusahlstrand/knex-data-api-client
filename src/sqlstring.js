const knexClientFactory = require('knex');

function format(sql, bindings, dialect) {
  const knexClient = knexClientFactory({ client: dialect });

  if (dialect === 'mysql') {
    return knexClient.raw(sql, bindings).toString();
  }

  return knexClient.raw(sql.replace(/`/g, '"').replace(/\$(\d+)/g, '?'), bindings).toString();
}

module.exports = {
  format,
};
