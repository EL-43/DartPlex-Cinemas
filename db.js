// db.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('MYSQL_URL available:', process.env.MYSQL_URL ? 'YES' : 'NO');

// Parse the MySQL URL
const sequelize = new Sequelize(process.env.MYSQL_URL, {
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log, // Enable to see SQL queries
  retry: {
    max: 5,
    timeout: 60000,
    match: [
      /ECONNREFUSED/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
    ],
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;