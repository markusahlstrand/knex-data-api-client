/* eslint-disable no-param-reassign */
const knexClientFactory = require('knex');

function replaceBindings(sql) {
  return Array.from(sql.matchAll(/([^'"]*)(['"]|$)/g)).reduce(
    ({ char, str }, token) => {
      if (char) {
        char = char !== token[2] ? char : null;
      } else {
        char = `"'`.includes(token[2]) && token[2];
        token[1] = token[1].replace(/\$(\d+)/g, '?');
      }
      str = str + token[1] + token[2];
      return { char, str };
    },
    { char: null, str: '' },
  ).str;
}

function format(sql, bindings, dialect) {
  const knexClient = knexClientFactory({ client: dialect });

  if (dialect === 'mysql') {
    return knexClient.raw(sql, bindings).toString();
  }

  return knexClient.raw(replaceBindings(sql.replace(/`/g, '"')), bindings).toString();
}

module.exports = {
  format,
};
