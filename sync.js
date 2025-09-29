const sequelize = require('./db');
const Film = require('./models/Film');
const User = require('./models/User');
const Cinema = require('./models/Cinema');
const CinemaFilm = require('./models/CinemaFilm');
const Schedule = require('./models/Schedule');

const filmsData = require('./Database/films.json');
const usersData = require('./Database/user.json');
const cinemasData = require('./Database/cinemas.json');
const schedulesData = require('./Database/jadwal.json');

async function init() {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL');

    // Sync all models
    await sequelize.sync({ force: true });
    console.log('All tables created successfully');

    // Seed films
    await Film.bulkCreate(filmsData);
    console.log('Films imported');

    // Seed users
    await User.bulkCreate(usersData);
    console.log('Users imported');

    // Seed cinemas
    const cinemaEntries = Object.entries(cinemasData);
    for (const [id, cinema] of cinemaEntries) {
      await Cinema.create({
        id,
        name: cinema.name,
        info: cinema.info
      });

      // Seed cinema-film relationships
      if (cinema.films && cinema.films.length > 0) {
        for (const filmId of cinema.films) {
          await CinemaFilm.create({
            cinemaId: id,
            filmId
          });
        }
      }
    }
    console.log('Cinemas and relationships imported');

    // Seed schedules
    for (const [filmId, schedules] of Object.entries(schedulesData)) {
      for (const schedule of schedules) {
        await Schedule.create({
          filmId,
          cinema: schedule.cinema,
          price: schedule.price,
          times: schedule.times
        });
      }
    }
    console.log('Schedules imported');

    console.log('Database initialization completed!');
    process.exit();
  } catch (err) {
    console.error('Initialization error:', err);
    process.exit(1);
  }
}

init();