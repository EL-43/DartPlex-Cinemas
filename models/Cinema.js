const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Cinema = sequelize.define('Cinema', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  info: DataTypes.STRING
}, {
  tableName: 'cinemas',
  timestamps: true,
});

module.exports = Cinema;