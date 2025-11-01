const env = process.env.NODE_ENV || 'development';
const config = require('./dbconfig')[env];
const Sequelize = require('sequelize');

let sequelize;
if (process.env.DB_USE_SQLITE) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'foodprint.sqlite', // This file will be created/used in your project root
    logging: false, // Disable logging SQL queries to console for cleaner output
  });
} else if (process.env.DB_URL) {
  sequelize = new Sequelize(config.url, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

module.exports = sequelize;
