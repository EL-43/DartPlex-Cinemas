const sequelize = require('../db');
const Film = require('./Film');
const User = require('./User');
const Cinema = require('./Cinema');
const CinemaFilm = require('./CinemaFilm');
const Schedule = require('./Schedule');

// relasi
Cinema.belongsToMany(Film, { through: CinemaFilm, foreignKey: 'cinemaId' });
Film.belongsToMany(Cinema, { through: CinemaFilm, foreignKey: 'filmId' });

Schedule.belongsTo(Film, { foreignKey: 'filmId' });
Film.hasMany(Schedule, { foreignKey: 'filmId' });

module.exports = {
    sequelize,
    Film,
    User,
    Cinema,
    CinemaFilm,
    Schedule
};