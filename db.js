const { Sequelize } = require('sequelize');
require('dotenv').config(); // ensures that dotenv is loaded here too

//only for testing, comment out later
console.log('Database connection details:', {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

const sequelize = new Sequelize(
  process.env.MYSQLDATABASE || 'your_database',
  process.env.MYSQLUSER || 'your_username', 
  process.env.MYSQLPASSWORD || 'your_password',
  {
    host: process.env.MYSQLHOST || 'localhost',
    port: process.env.MYSQLPORT || 3306,
    dialect: 'mysql',
    logging: console.log, // Enable to see SQL queries
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    retry: {
      max: 5, // Maximum retry 5 times
      timeout: 60000, // Set a 60s timeout
      match: [
        /ECONNREFUSED/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
    }
  }
);

module.exports = sequelize;