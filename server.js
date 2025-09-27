const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const { json } = require('stream/consumers');
const localPort = 3000; // port localhost

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
const server = http.createServer((req, res) =>{
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
        parseBody(req, (body) => {
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
                const data = fs.readFileSync(path.join(__dirname, 'Database', 'user.json'), 'utf-8');
                const users = JSON.parse(data)

                const user = users.find(u => u.username === username && u.email === email && u.password === password);
               
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
                console.log('Terjadi kesalahan saat membaca user.json:', err);
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
        parseBody(req, (body) => {
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
                const filePath = path.join(__dirname, 'Database', 'user.json');
                let users = [];

                if (fs.existsSync(filePath)) {
                    const data = fs.readFileSync(filePath, 'utf-8');
                    if (data.trim().length > 0) {
                        users = JSON.parse(data);
                    }
                }

                // cek duplikasi username
                if (users.find(u => u.username === username)) {
                    res.writeHead(409, { 'content-type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        message: 'Username sudah terdaftar!'
                    }));
                    return;
                }

                // cek duplikasi email
                if (users.find(u => u.email === email)) {
                    res.writeHead(409, { 'content-type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        message: 'Email sudah terdaftar!'
                    }));
                    return;
                }

                users.push({ username, email, password, role: "user" });
                fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');

                res.writeHead(201, { 'content-type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Pendaftaran Berhasil!',
                    username,
                    role: "user"
                }));
            } catch (err) {
                console.log('Terjadi kesalahan saat menulis user.json:', err);
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
            const filmPath = path.join(__dirname, 'Database', 'films.json');
            fs.readFile(filmPath, 'utf-8', (err, data) =>{
                if(err){
                    console.log('Error: ', err);
                    res.writeHead(500, {'content-type' : 'application/json'});
                    return res.end(JSON.stringify({error: 'Film Tidak Berhasil di Masukkan!'}))
                }
                let films = [];
                if(data.trim()){
                    try{
                        films = JSON.parse(data);
                    } catch(e){
                        console.log('Error: ', e);
                    }
                    res.writeHead(200, {'content-type' : 'application/json'});
                    res.end(JSON.stringify(films));
                }
            })
        } else if(req.method === 'POST'){
            parseBody(req, (body) =>{
                try{
                    const filmPath = path.join(__dirname, 'Database', 'films.json');
                    let films = [];
                    // cek dan jalankan klo emang ada aja
                    if(fs.existsSync(filmPath)){
                        const data = fs.readFileSync(filmPath, 'utf-8');
                        if(data.trim()){
                            films = JSON.parse(data);
                        }
                    }
                    // properti film
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

                    const index = films.findIndex(f => f.id === cleanId);
                    if (index >= 0) {
                        // Update
                        films[index] = {
                            id: cleanId,
                            title,
                            genre: genre || '',
                            rating: rating || 'SU',
                            poster,
                            description,
                            duration,
                            format,
                            trailer
                        };
                    } else {
                        // Tambah baru
                        films.push({
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
                    fs.writeFileSync(filmPath, JSON.stringify(films, null, 2), 'utf-8');

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
            const filmPath = path.join(__dirname, 'Database', 'films.json');
            let films = [];

            if(fs.existsSync(filmPath)){
                const data = fs.readFileSync(filmPath, 'utf-8');
                if(data.trim()){
                    films = JSON.parse(data);
                }
            }

            const initialLength = films.length;
            films = films.filter(film => film.id !== id);

            if(films.length === initialLength){
                res.writeHead(404, {'content-type' : 'application/json'});
                return res.end(JSON.stringify({
                    success: false,
                    message: 'Film tidak ditemukan!'
                }))
            }

            fs.writeFileSync(filmPath, JSON.stringify(films, null, 2), 'utf-8');

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
        const cinemaPath = path.join(__dirname, 'Database', 'cinemas.json');
        fs.readFile(cinemaPath, 'utf-8', (err, data) => {
            if (err) {
                console.error('Gagal baca cinemas.json:', err);
                res.writeHead(500, { 'content-type': 'application/json' });
                return res.end(JSON.stringify({ 
                    error: 'Gagal memuat data bioskop' 
                }))
            }
            let cinemas = {};
            if(data.trim()){
                try{
                    cinemas = JSON.parse(data);
                } catch(err){
                    console.error('Error: ', err);
                }
            }
            res.writeHead(200, {'content-type' : 'application/json'});
            res.end(JSON.stringify(cinemas));
        })
    }
    else if(pathname === '/api/cinemas' && req.method === 'POST'){
        parseBody(req, (body) =>{
            try{
                const {cinemaId, filmIds} = body;
                if (!cinemaId || !filmIds) {
                    res.writeHead(400, { 'content-type': 'application/json' });
                    return res.end(JSON.stringify({ 
                        success: false, 
                        message: 'Data tidak lengkap' 
                  }));
                }

                const cinemaPath = path.join(__dirname, 'Database', 'cinemas.json');
                let cinemas = {};

                if(fs.existsSync(cinemaPath)){
                    const data = fs.readFileSync(cinemaPath, 'utf-8');
                    if(data.trim()){
                        cinemas = JSON.parse(data);
                    }
                }

                if (!cinemas[cinemaId]) {
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

                cinemas[cinemaId].films = filmsArray;
                
                fs.writeFileSync(cinemaPath, JSON.stringify(cinemas, null, 2), 'utf-8');
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
        sendFile(res, path.join(__dirname, 'Database', 'films.json'), 'application/json');
    } else if(pathname === '/cinemas.json'){
        sendFile(res, path.join(__dirname, 'Database', 'cinemas.json'), 'application/json');
    } else if (pathname === '/assign') {
    sendFile(res, path.join(__dirname, 'External', 'assign.html'));
    } else if(pathname === '/jadwal.json'){
        sendFile(res, path.join(__dirname, 'Database', 'jadwal.json'), 'application/json');
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

server.listen(localPort, () =>{
    console.log(`Deployed to http://localhost:${localPort}`);
});