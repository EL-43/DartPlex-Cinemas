const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  filmId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'films',
      key: 'id'
    }
  },
  cinema: DataTypes.STRING,
  price: DataTypes.STRING,
  times: DataTypes.JSON
}, {
  tableName: 'schedules',
  timestamps: true,
});

module.exports = Schedule;