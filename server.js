const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const { json } = require('stream/consumers');
const localPort = 3000; // port localhost

// Database models
const sequelize = require('./db');
const Film = require('./models/Film');
const User = require('./models/User');
const Cinema = require('./models/Cinema');
const CinemaFilm = require('./models/CinemaFilm');
const Schedule = require('./models/Schedule');

Cinema.belongsToMany(Film, { through: CinemaFilm, foreignKey: 'cinemaId' });
Film.belongsToMany(Cinema, { through: CinemaFilm, foreignKey: 'filmId' });

// helper, khusus baca file
function sendFile(res, filePath, contentType = 'text/html'){
    fs.readFile(filePath, (err, content) =>{
        if(err){
            res.writeHead(404, {'content-type' : 'text/plain'});
            res.end('404 Not Found!'); // coba cek directory kalo file ilang
            return;
        } else{
            res.writeHead(200, {'content-type' : contentType});
            res.end(content);
        }
    });
}

// Metode post untuk Login
function parseBody(req, callback){
    let body = '';
    // kirim data kecil jadi string
    req.on('data', chunk =>{
        body += chunk.toString();
    });
    req.on('end', () =>{
        const params = new URLSearchParams(body);
        const result = {};
        for(let [key, value] of params){
            result[key] = value;
        }
        callback(result);
    });
}

//add to pathname
const server = http.createServer(async (req, res) =>{
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    if(pathname === '/' || pathname === '/index'){
        sendFile(res, path.join(__dirname, 'index.html'));
    } else if(pathname === '/login'){
        sendFile(res, path.join(__dirname, 'External', 'login.html'));
    } else if(pathname === '/cinemas'){
        sendFile(res, path.join(__dirname, 'External', 'cinemas.html'));
    } else if(pathname === '/movies'){
        sendFile(res, path.join(__dirname, 'External', 'moviemain.html')); // ubah ke moviemain (testing)
    } else if(pathname === '/movie'){
        sendFile(res, path.join(__dirname, 'External', 'movie.html')); // detail
    } else if(pathname === '/signup'){
        sendFile(res, path.join(__dirname, 'External', 'signup.html'));
    } else if(pathname === '/addmovie'){
        sendFile(res, path.join(__dirname, 'External', 'addmovie.html'));
    }

    // login
    else if(pathname === '/api/login' && req.method === 'POST'){
        parseBody(req, async (body) => {
            const {username, email, password} = body;

            if(!username || !email || !password){
                res.writeHead(400, {'content-type' : 'application/json'});
                res.end(JSON.stringify({
                    success: false,
                    message: 'Semua bagian wajib diisi!'
                }));
                return;
            }

            try{
                // Database query menggunakan Sequelize
                const user = await User.findOne({
                    where: { username, email, password }
                });

                // if found
                if(user){
                    res.writeHead(200, {'content-type' : 'application/json'});
                    res.end(JSON.stringify({
                        success: true,
                        message: 'Login Berhasil!',
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }));
                } else{
                    res.writeHead(401, {'content-type' : 'application/json'});
                    res.end(JSON.stringify({
                        success: false,
                        message: 'Email atau Password salah!'
                    }));
                }
            } catch(err){
                console.log('Terjadi kesalahan saat membaca database:', err);
                res.writeHead(500, {'content-type' : 'application/json'});
                res.end(JSON.stringify({
                    success: false,
                    message: 'Server Gagal!' 
                }));
            }
        });

        return;
    }
    //signup
    else if (pathname === '/api/signup' && req.method === 'POST') {
        parseBody(req, async (body) => {
            const {username, email, password} = body;

            if(!username || !email || !password){
                res.writeHead(400, {'content-type' : 'application/json'});
                res.end(JSON.stringify({
                    success: false,
                    message: 'Semua bagian wajib diisi!'
                }));
                return;
            }

            try {
                // Database query menggunakan Sequelize
                // cek duplikasi username
                const existingUsername = await User.findOne({ where: { username } });
                if (existingUsername) {
                    res.writeHead(409, { 'content-type': 'application/json' });
                    return res.end(JSON.stringify({
                        success: false,
                        message: 'Username sudah terdaftar!'
                    }));
                }

                // cek duplikasi email
                const existingEmail = await User.findOne({ where: { email } });
                if (existingEmail) {
                    res.writeHead(409, { 'content-type': 'application/json' });
                    return res.end(JSON.stringify({
                        success: false,
                        message: 'Email sudah terdaftar!'
                    }));
                }

                // Buat user baru
                const newUser = await User.create({ 
                    username, 
                    email, 
                    password, 
                    role: "user" 
                });

                res.writeHead(201, { 'content-type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Pendaftaran Berhasil!',
                    username,
                    role: "user"
                }));
            } catch (err) {
                console.log('Terjadi kesalahan saat menulis database:', err);
                res.writeHead(500, { 'content-type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Server Gagal!'
                }));
            }
    });

    return;
    } 
    // api film
    else if(pathname === '/api/films'){
        if(req.method === 'GET'){
            // Database query menggunakan Sequelize
            try {
                const films = await Film.findAll();
                res.writeHead(200, {'content-type' : 'application/json'});
                res.end(JSON.stringify(films));
            } catch(err) {
                console.log('Error: ', err);
                res.writeHead(500, {'content-type' : 'application/json'});
                return res.end(JSON.stringify({error: 'Film Tidak Berhasil di Masukkan!'}))
            }
        } else if(req.method === 'POST'){
            parseBody(req, async (body) =>{
                try{
                    const {
                        id,
                        title,
                        genre,
                        rating,
                        poster,
                        description,
                        duration = "120m", // set default
                        format = "2D", // set default
                        trailer = "#" // tanpa trailer
                    } = body;

                    if(!title || !poster || !description){
                        res.writeHead(400, {'content-type' : 'application/json'});
                        return res.end(JSON.stringify({
                            success: false, 
                            message: "Semua Field Wajib di Isi!"
                        }));
                    }

                    if (!id || typeof id !== 'string' || id.trim() === '') {
                        res.writeHead(400, { 'content-type': 'application/json' });
                        return res.end(JSON.stringify({
                            success: false,
                            message: "ID film tidak valid!"
                        }));
                    }

                    const cleanId = id.trim();

                    // Database operation menggunakan Sequelize
                    const existingFilm = await Film.findByPk(cleanId);
                    if (existingFilm) {
                        // Update existing film
                        await Film.update({
                            title,
                            genre: genre || '',
                            rating: rating || 'SU',
                            poster,
                            description,
                            duration,
                            format,
                            trailer
                        }, { where: { id: cleanId } });
                    } else {
                        // Create new film
                        await Film.create({
                            id: cleanId,
                            title,
                            genre: genre || '',
                            rating: rating || 'SU',
                            poster,
                            description,
                            duration,
                            format,
                            trailer
                        });
                    }

                    res.writeHead(200, {'content-type' : 'application/json'});
                    res.end(JSON.stringify({
                        success: true,
                        message: "Film Berhasil di Simpan!"
                    }))
                } catch(err){
                    console.error('Error: ', err);
                    res.writeHead(500, {'content-type' : 'application/json'});
                    res.end(JSON.stringify({
                        success: false,
                        message: "Terjadi Kesalahan!"
                    }))
                }
            })
            return;
        }
    }
    // delete film 
    else if(pathname.startsWith('/api/films') && req.method === 'DELETE'){
        const id = pathname.replace('/api/films/', '');

        if(!id || id === 'undefined'){
            res.writeHead(400, {'content-type' : 'application/json'});
            return res.end(JSON.stringify({
                success: false,
                message: 'ID Film tidak valid!'
            }))
        }

        try{
            // Database operation menggunakan Sequelize
            const result = await Film.destroy({ where: { id } });
            
            if(result === 0){
                res.writeHead(404, {'content-type' : 'application/json'});
                return res.end(JSON.stringify({
                    success: false,
                    message: 'Film tidak ditemukan!'
                }))
            }

            res.writeHead(200, { 'content-type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'Film berhasil dihapus!'
            }))
        } catch(err){
            console.error('Error: ', err);
            res.writeHead(500, { 'content-type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Film tidak terhapus!'
            }))
        }
        return;
    }
    // API Cinema
    else if(pathname === '/api/cinemas' && req.method === 'GET'){
        // Database query menggunakan Sequelize
        try {
            const cinemas = await Cinema.findAll({
                include: [{
                    model: Film,
                    through: { attributes: [] } // Exclude join table attributes
                }]
            });

            // Convert to expected format
            const cinemaMap = {};
            cinemas.forEach(cinema => {
                cinemaMap[cinema.id] = {
                    name: cinema.name,
                    info: cinema.info,
                    films: cinema.Films.map(film => film.id)
                };
            });

            res.writeHead(200, {'content-type' : 'application/json'});
            res.end(JSON.stringify(cinemaMap));
        } catch(err) {
            console.error('Gagal baca database:', err);
            res.writeHead(500, { 'content-type': 'application/json' });
            return res.end(JSON.stringify({ 
                error: 'Gagal memuat data bioskop' 
            }))
        }
    }
    else if(pathname === '/api/cinemas' && req.method === 'POST'){
        parseBody(req, async (body) =>{
            try{
                const {cinemaId, filmIds} = body;
                if (!cinemaId || !filmIds) {
                    res.writeHead(400, { 'content-type': 'application/json' });
                    return res.end(JSON.stringify({ 
                        success: false, 
                        message: 'Data tidak lengkap' 
                    }));
                }

                // Database operations menggunakan Sequelize
                // Check if cinema exists
                const cinema = await Cinema.findByPk(cinemaId);
                if (!cinema) {
                    res.writeHead(404, { 'content-type': 'application/json' });
                    return res.end(JSON.stringify({ 
                        success: false, 
                        message: 'Bioskop tidak ditemukan' 
                    }))
                }

                let filmsArray = [];
                if(typeof filmIds === 'string'){
                    filmsArray = filmIds ? filmIds.split(',') : [];
                } else if(Array.isArray(filmIds)){
                    filmsArray = filmIds;
                }

                // Clear existing relationships
                await CinemaFilm.destroy({ where: { cinemaId } });

                // Create new relationships
                for (const filmId of filmsArray) {
                    await CinemaFilm.create({ cinemaId, filmId });
                }
                
                res.writeHead(200, {'content-type' : 'application/json'});
                res.end(JSON.stringify({
                    success: true,
                    message: 'Berhasil diperbarui!'
                }))
            } catch(err){
                console.error('Error: ', err);
                res.writeHead(500, {'content-type' : 'application/json'});
                res.end(JSON.stringify({
                    success: false,
                    message: 'Gagal diperbarui!'
                }))
            }
        })
    }
    else if(pathname === '/films.json'){
        // Database query menggunakan Sequelize untuk kompatibilitas
        try {
            const films = await Film.findAll();
            res.writeHead(200, {'content-type': 'application/json'});
            res.end(JSON.stringify(films));
        } catch(err) {
            console.error('Error loading films:', err);
            res.writeHead(500, {'content-type': 'application/json'});
            res.end(JSON.stringify([]));
        }
    } else if(pathname === '/cinemas.json'){
        // Database query menggunakan Sequelize untuk kompatibilitas
        try {
            const cinemas = await Cinema.findAll({
                include: [{
                    model: Film,
                    through: { attributes: [] }
                }]
            });

            const cinemaMap = {};
            cinemas.forEach(cinema => {
                cinemaMap[cinema.id] = {
                    name: cinema.name,
                    info: cinema.info,
                    films: cinema.Films.map(film => film.id)
                };
            });

            res.writeHead(200, {'content-type': 'application/json'});
            res.end(JSON.stringify(cinemaMap));
        } catch(err) {
            console.error('Error loading cinemas:', err);
            res.writeHead(500, {'content-type': 'application/json'});
            res.end(JSON.stringify({}));
        }
    } else if (pathname === '/assign') {
        sendFile(res, path.join(__dirname, 'External', 'assign.html'));
    } else if(pathname === '/jadwal.json'){
        // Database query menggunakan Sequelize untuk kompatibilitas
        try {
            const schedules = await Schedule.findAll();
            const scheduleMap = {};

            schedules.forEach(schedule => {
                if (!scheduleMap[schedule.filmId]) {
                    scheduleMap[schedule.filmId] = [];
                }
                scheduleMap[schedule.filmId].push({
                    cinema: schedule.cinema,
                    price: schedule.price,
                    times: schedule.times
                });
            });

            res.writeHead(200, {'content-type': 'application/json'});
            res.end(JSON.stringify(scheduleMap));
        } catch(err) {
            console.error('Error loading schedules:', err);
            res.writeHead(500, {'content-type': 'application/json'});
            res.end(JSON.stringify({}));
        }
    }
    // direktori lain CSS, External JS
    else if(pathname.startsWith('/css/')){
        const cssPath = path.join(__dirname, 'CSS', pathname.substring(5));
        sendFile(res, cssPath, 'text/css');
    }
    else if(pathname.startsWith('/js/')){
        const jsPath = path.join(__dirname, 'js', pathname.substring(4));
        sendFile(res, jsPath, 'application/javascript')
    }
    else if(pathname.startsWith('/images/')){
        const imagePath = path.join(__dirname, 'images', pathname.substring(8));
        const ext = path.extname(imagePath).toLowerCase();

        let contentType = 'image/jpeg';
        if(ext === '.png') contentType = 'image/png';
        if(ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        if(ext === '.webp') contentType = 'image/webp';

        sendFile(res, imagePath, contentType);
    }
    
    //ERROR
    else{
        res.writeHead(404, {'content-type' : 'text/plain'});
        res.end('404 Not Found'); // fatal error, cek kode
    }
});

// Initialize database connection before starting server
async function initializeServer() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established');
        
        server.listen(localPort, () =>{
            console.log(`Deployed to http://localhost:${localPort}`);
        });
    } catch (error) {
        console.error('Unable to connect to database:', error);
        process.exit(1);
    }
}

initializeServer();