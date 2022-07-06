require('dotenv').config();
module.exports = {
  development: {
    url: process.env.CLEARDB_DATABASE_URL,
    dialect: process.env.DB_DIALECT,
    logging: true,
    dialectOptions: {
      ssl: {
        /* <----- Add SSL option for Postgres */
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    url: process.env.CLEARDB_DATABASE_URL,
    dialect: process.env.DB_DIALECT,
    logging: true,
    dialectOptions: {
      ssl: {
        /* <----- Add SSL option for Postgres */
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  staging: {
    url: process.env.DATABASE_URL,
    dialect: process.env.DB_DIALECT,
    logging: true,
    dialectOptions: {
      ssl: {
        /* <----- Add SSL option for Postgres */
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  production: {
    url: process.env.CLEARDB_DATABASE_URL,
    dialect: process.env.DB_DIALECT,
    logging: false,
    dialectOptions: {
      ssl: {
        /* <----- Add SSL option for Postgres */
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};
