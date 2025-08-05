const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PG_HOST || 'db',
  user: 'postgres',
  password: 'postgres',
  database: 'testdb',
  port: 5432,
});

module.exports = pool;
