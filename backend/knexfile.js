module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.PG_HOST || process.env.POSTGRES_HOST || 'db',
      port: process.env.POSTGRES_PORT || 5432,
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'testdb',
    },
    migrations: {
      directory: './migrations'
    },
    pool: {
      min: 2,
      max: 10
    },
    debug: process.env.DEBUG === 'true' || process.env.LOG_LEVEL === 'debug'
  },
  
  test: {
    client: 'pg',
    connection: {
      host: process.env.PG_HOST || process.env.POSTGRES_HOST || 'db',
      port: process.env.POSTGRES_PORT || 5432,
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'testdb_test',
    },
    migrations: {
      directory: './migrations'
    }
  },
  
  production: {
    client: 'pg',
    connection: {
      host: process.env.PG_HOST || process.env.POSTGRES_HOST || 'db',
      port: process.env.POSTGRES_PORT || 5432,
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB || 'testdb_prod',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    },
    migrations: {
      directory: './migrations'
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};
