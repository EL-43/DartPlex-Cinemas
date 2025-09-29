const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('dartplex', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
  acquire: 30000,
  idle: 10000
});

module.exports = sequelize;