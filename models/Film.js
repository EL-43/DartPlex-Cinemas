const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Film = sequelize.define('Film', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  poster: DataTypes.STRING,
  genre: DataTypes.STRING,
  rating: {
    type: DataTypes.STRING,
    defaultValue: 'SU'
  },
  duration: {
    type: DataTypes.STRING,
    defaultValue: '120m'
  },
  format: {
    type: DataTypes.STRING,
    defaultValue: '2D'
  },
  trailer: {
    type: DataTypes.STRING,
    defaultValue: '#'
  },
  description: DataTypes.TEXT,
}, {
  tableName: 'films',
  timestamps: true,
});

module.exports = Film;