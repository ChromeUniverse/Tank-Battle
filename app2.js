// module imports
require('dotenv').config();
const express = require('express');

const jwt = require('jsonwebtoken');
const fs = require('fs');
// const mysql = require('mysql2');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const atob = require('atob');
const validator = require('validator');


// set up Express and middleware

const app = express();

var cookieParser = require('cookie-parser')
app.use(cookieParser())

const cors = require('cors');
app.use(cors(
    { origin: ["http://localhost:4000", "http://localhost:5000"] }
));

app.use(express.static('public'));
app.use(express.json());

// fs
const path_to_htmls = __dirname + '/private/html/';



// mysql functions

async function dbConnect () {
    mysql.createConnection({
        host     : 'localhost',
        user     : 'lucca',
        password : process.env.MYSQL_PASSWORD, 
        database : 'tank_battle'
    });
}



 
// const api = require('./router1');
// app.use('/api/', api);

const port = 4000;

let refreshTokens = [];





function getHTML(name){
    return fs.readFileSync(path_to_htmls + 'name', 'UTF-8').toString();
}




// auth functions

function generateAccessToken(user) {
    // return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '25s'});
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
}

function is_alpha_num(string) {
    return (string.match(/^[a-z0-9]+$/i) !== null);
}

function no_whitespace(string) {
    return string.match(/^[^\s]+$/) !== null
}

async function hash(input) {
    let salt = await bcrypt.genSalt(12);
    let hash = await bcrypt.hash(input, salt);
    console.log('Hashed', input, 'to', hash, '\n');
    return hash;
}


// function authenticateToken(req, res, next) { 
//     const authHeader = req.headers['authorization'];
    
//     let token;

//     // got auth header -> get token
//     if (authHeader !== undefined) { token = authHeader.split(' ')[1]; } 

//     // no auth header -> send regular page
//     else { return [401, req, res]; }

//     // verify token
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//         if (err) return [403, req, res];
//         req.user = user; 
//         return [200, req, res]      
//     });
// }


function private(req, res, next) {   
    
    let accessToken;

    console.log('Got private request.')

    // console.log('Here is cookies:', req.cookies);

    if (req.cookies.token !== undefined) {
        // get token and put it in the request object

        accessToken = req.cookies.token;        
        req.token = accessToken;
    }
    else { 
        res
            .status(401)
            .send(fs.readFileSync(path_to_htmls + '401.html', 'UTF-8').toString());         
        return;
    }

    // verify token
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, userObject) => {

        // console.log('Decoded user object:', userObject);

        // if (err) return res.sendStatus(403);

        // const sql = 'select id from users where username = ?';

        // app.db.execute(sql, [userObject.username], (results, fields, e) => {

        //     console.log('Got here!');

        //     if (results.length > 0) {

        //         req.user = userObject; 
        //         return next();  
    
        //     } else {
        //         return res.sendStatus(403);
        //     }

        // });   
        
        
        if (err) {
            // console.log('Error while decoding')
            return res.sendStatus(403);
        }

        req.user = userObject;
        
        return next();
        
    });
}

function redirectUser(req, res, next) {   
    
    let accessToken;

    console.log('Here is cookies:', req.cookies);

    // got auth header -> get token
    // const authHeader = req.headers['authorization'];
    // if (authHeader !== undefined) { accessToken = authHeader.split(' ')[1]; } 
    // else { return res.sendStatus(401); }    // no auth header -> send regular page

    if (req.cookies.token !== undefined) {
        accessToken = req.cookies.token
    } 
    else { 
        return next();
    }

    // verify token
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {

        req.user = user;
        if (err) {
            // console.log('Error while decoding')
            return res.sendStatus(403);
        }
        
        return res.redirect('/');
    });
}


// Routes

app.get('/', (req, res) => { 
    res.status(200);
    return res.send(fs.readFileSync(path_to_htmls + 'index.html', 'UTF-8').toString());
});

app.post('/token', (req, res) => {
    const refreshToken = req.body.token;

    if (refreshToken === undefined) return res.sendStatus(401);

    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);

        const accessToken = generateAccessToken(
            { name: user.username, userID: 123456, tankColor: '#123456' }
        );

        res.json(accessToken);
    });
});

app.delete('/logout', private, (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
});

app.get('/signup', redirectUser, (req, res)=> {  
    res.status(200);        
    return res.send(fs.readFileSync(path_to_htmls + 'signup.html', 'UTF-8').toString());         
});

app.get('/login', redirectUser, (req, res)=> {  
    res.status(200);        
    return res.send(fs.readFileSync(path_to_htmls + 'login.html', 'UTF-8').toString());         
});

app.get('/user', private, (req, res)=> {  
    res.status(200);        
    return res.send(fs.readFileSync(path_to_htmls + 'user.html', 'UTF-8').toString());         
});

app.get('/lb', private, async (req, res)=> {  
    res.status(200);        
    return res.send(fs.readFileSync(path_to_htmls + 'lb.html', 'UTF-8').toString());         
});

app.get('/logout', private, (req, res)=> {  
    res
        .status(200)        
        .clearCookie("token")
        .send(fs.readFileSync(path_to_htmls + 'logout.html', 'UTF-8').toString());         
    return;
});


app.get('/api/*', private, async (req, res) => {

    // const db = app.db;

    let endpoint = req.url.substr(5);
    console.log("Got API request here:", endpoint);
    // console.log('Here is cookies:', req.cookies)

    if (endpoint == 'user') {

        const name = JSON.parse(atob(req.token.split('.')[1])).username.toString();
        // const name = 'qrno';
        const sql = "select username, elo, lb_rank, tank_color from users where username=?"

        try {
            const [query_result, fields, err] = await app.db.execute(sql, [name]);

            if (query_result.length > 0) {

                console.log(query_result);
                console.log(err);
                const q = query_result[0]

                // BinaryRow {
                //     username: 'Lucca',
                //     elo: 1000,
                //     lb_rank: 1,
                //     tank_color: 16711935
                //   }

                const userData = {
                    error: false,
                    name: q.username,
                    elo: q.elo,
                    lb_rank: q.lb_rank,
                    tank_color: q.tank_color
                }

                res.status(200);
                res.json(userData);
                return;

            } else {
                console.log('user not found');

                res.status(404);
                res.json({
                    error: true,
                    message: 'User not found'
                });
                return;

            }


            
        }

        catch (e) { 
            res.status(500);
            res.json({
                error: true,
                message: 'Server Error'
            });
            console.error(e);
            return;
        }

    }

    if (endpoint == 'leaderboard') {
        const lb = {
            lb: [
                {username: 'Lucca', elo: 2000},
                {username: 'superjp64', elo: 1700},
                {username: 'qrno', elo: 1600},
                {username: 'Rachel', elo: 1500},
                {username: 'Ben Awad', elo: 1400},
                {username: 'Tim Dodd', elo: 1300},
            ]
        }

        res.status(200);
        res.json(userData);
        return;
    }
}); 


// handle POST requests

app.post('/signup', async (req, res) => {

    console.log('Got signup POST');

    // parse JSON body 
    console.log(req.body);
    const email = req.body['email'].toString();
    // console.log(email)
    const username = req.body['username'].toString();
    // console.log(username);
    const password = req.body['password'].toString();
    console.log('here is password', password);
    const password2 = req.body['password2'].toString();
    console.log('here is password', password2);
    
    // check for valid input

    let isEmailValid = validator.isEmail(email);
    let isUsernameValid = is_alpha_num(username) && (username.length < 25);
    let isPasswordValid = no_whitespace(password) && (password.length < 100);

    if ( !isEmailValid ) {
        console.log('Invalid email.');
        return res.status(400).json(
            {status: 'error', message: 'Invalid Email.'}
        );
    }

    if (!isUsernameValid) {
        console.log('Invalid username.');
        return res.status(400).json(
            {status: 'error', message: 'Invalid username. Only alphanumeric chars are allowed!'}
        );
    }

    if ( !isPasswordValid ) {
        console.log('Invalid password.');
        return res.status(400).json(
            {status: 'error', message: 'Invalid password.'}
        );
    }

    if (password !== password2) {
        console.log('Passwords don\'t match.');
        return res.status(400).json(
            {status: 'error', message: 'Passwords don\'t match.'}
        );
    }

    // passed preliminary validity checks
    // add new user to database

    try {

        const sql1 = "select username from users where username=?";
        const [query_result1, fields1, err1] = await app.db.execute(sql1, [username]);

        const sql2 = "select email from users where email=?";
        const [query_result2, fields2, err2] = await app.db.execute(sql2, [email]);

        if (query_result1.length > 0) {

            // username already exists
      
            console.log('username taken');

            const json = {
                error: true,
                message: 'That username was already taken.'
            }

            res.status(403);
            res.json(json);
            return;            

        } 

        else if (query_result2.length > 0) {

            // email already exists
      
            console.log('email taken');

            const json = {
                error: true,
                message: 'Email already registered.'
            }

            res.status(403);
            res.json(json);
            return;       

        }        
        
        else {

            // hash input password

            const hashedPassword = await hash(password);

            // write to database

            const sql1 = 
                `insert into users (username, hashed_password, email, elo, tank_color, lb_rank) 
                values (?, ?, ?, ?, ?, ?);`;    
                
            const [query_result1, fields1, err1] = await app.db.execute(sql1, [username, hashedPassword, email, 1000, '#' + Math.floor(Math.random()*(2**24)).toString(16).padStart(6, '0'), 0]);            

            // fetch data from database

            const sql2 = 'select username, id, tank_color from username=?';    
            const [query_result2, fields2, err2] = await app.db.execute(sql2, [username]);            

            const q = query_result2[0];

            // generate jwt access token
    
            const user = { username: q.username, userID: q.id, tankColor: q.tank_color };
            const accessToken = generateAccessToken(user);
            
            // const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
            // refreshTokens.push(refreshToken);
        
            res
                .status(200)
                .cookie('token', accessToken, {httpOnly: true})
                // .redirect(302, '/');
                .json({
                    error: false,
                    message: 'Success! New user created.'
                });
            return;

        }

    }

    catch(e) {
        res.status(500);
        res.json({
            error: true,
            message: 'Server Error'
        });
        console.error(e);
        return;
    }
});



app.post('/login', async (req, res) => {

    // parse JSON body 
    console.log(req.body);
    const username = req.body.username.toString();
    console.log(username);
    const password = req.body.password.toString();
    console.log(password);

    // authenticate user    

    try {

        const sql = "select id, username, hashed_password, tank_color from users where username=?";

        const [query_result, fields, err] = await app.db.execute(sql, [username]);

        if (query_result.length > 0 ) {

            console.log(query_result);
            console.log(err);

            const q = query_result[0]

            // BinaryRow {
            //     username: 'Lucca',
            //     elo: 1000,
            //     lb_rank: 1,
            //     tank_color: 16711935
            //   }

            console.log('Trying to authenticate user', username, 'with password', password);        
            console.log('Correct password is', q.hashed_password);
                        
            const match = await bcrypt.compare(password, q.hashed_password);                    

            if (match) {

                console.log('Match!');
            
                // generate jwt access token
    
                const user = { username: q.username, userID: q.id , tankColor: q.tank_color };
                const accessToken = generateAccessToken(user);
                
                // const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
                // refreshTokens.push(refreshToken);

                const json = { error: false, message: 'Success!' };
            
                res
                    .status(200)
                    .cookie('token', accessToken, { httpOnly: true } )                    
                    .json(json);
                return;


            } else {

                console.log('No Match');

                const json = {
                    error: true,
                    message: 'Wrong password.'
                }
    
                res.status(401);
                res.json(json);
                return;

            }
            

        } else {

            console.log('user not found');

            res.status(404);
            res.json({
                error: true,
                message: 'Incorrect username.'
            });
            return;

        }


        if (username != 'Lucca' || password != '123') {
            console.log('Wrong Credentials');
            return res.status(403).send('Wrong credentials!');
        }
    
        // send jwt access token
    
        const user = { username: username, userID: 123456, tankColor: '#123456' };
        const accessToken = generateAccessToken(user);
        
        // const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
        // refreshTokens.push(refreshToken);
    
        res
            // .status(200)
            .cookie('token', accessToken, {httpOnly: true})
            // .redirect(302, '/');
            .send();
        return;

    }

    catch(e) {
        res.status(500);
        res.json({
            error: true,
            message: 'Server Error'
        });
        console.error(e);
        return;
    }

    
});



app.get('/play/*', private, (req, res) => {

    let endpoint = req.url.substr(6);
    console.log("Got Play request here:", endpoint);

    if (!is_alpha_num(endpoint)) {res.sendStatus(400)}

    const accessToken = jwt.decode(req.cookies.token);

    // replacing USERNAME, COLOR, ROOM with actual player name and random color
    res.status(200);
    // res.redirect(301, 'http://yourotherdomain.com' + req.path)
    let data = fs.readFileSync(path_to_htmls + 'room.html');
    res.send(
        data.toString()
            .replace('USERNAME', accessToken.username)
            .replace('COLOR', accessToken.tankColor)
            .replace('ROOMNAME', endpoint)
    );
    return;
});


app.use(function (req, res) {
    res.status(404).send(fs.readFileSync(path_to_htmls + '404.html').toString());
});


// app.on('listening', ()=>{});


// Start server
app.listen(port, async () => {

    // connect to database

    app.db = await mysql.createConnection({
        host     : 'localhost',
        user     : 'lucca',
        password : process.env.MYSQL_PASSWORD, 
        database : 'tank_battle'
    });
    
    console.log(`Server started at http://localhost:${port}`);
});