module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.PG_HOST || 'db',
      user: 'postgres',
      password: 'postgres',
      database: 'testdb',
    },
    migrations: {
      directory: './migrations'
    }
  }
};
