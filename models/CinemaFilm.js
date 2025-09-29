const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const CinemaFilm = sequelize.define('CinemaFilm', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  cinemaId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'cinemas',
      key: 'id'
    }
  },
  filmId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'films',
      key: 'id'
    }
  }
}, {
  tableName: 'cinema_films',
  timestamps: true,
});

module.exports = CinemaFilm;