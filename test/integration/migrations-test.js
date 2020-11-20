const knexMigrate = require('knex-migrate');

async function migrateToLatest(knexFilePath) {
  const log = ({ action, migration }) => console.log('Doing ' + action + ' on ' + migration);

  await knexMigrate(
    'up',
    {
      knexfile: knexFilePath,
      migrations: 'test/integration/migrations',
    },
    log,
  );
}

module.exports = {
  migrateToLatest,
};
