require('dotenv').config();

module.exports = {
  client: 'pg',
  connection: process.env.LOCAL_POSTGRES_CONNECTION || 'postgres://localhost',
};
