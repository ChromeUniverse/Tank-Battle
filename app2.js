// NPM module imports
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const {readFile} = require('fs/promises');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const atob = require('atob');
const validator = require('validator');

// custom module imports
const { sql_connect, get_db } = require('./sql_util');

// middleware functions
const { private } = require('./middleware/private');
const { redirectUser } = require('./middleware/redirectUser');


// set up Express and middleware
const app = express();

var cookieParser = require('cookie-parser')
app.use(cookieParser())

const cors = require('cors');
app.use(cors(
    { origin: ["http://localhost:4000", "http://localhost:5000"] }
));

// static fileserver middleware
app.use(express.static('public'));
app.use(express.json());

const port = 4000;

// API routes
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

// logout
const logoutRouter = require('./routes/logout');
app.use('/logout', logoutRouter);

// play
const playRouter = require('./routes/play');
app.use('/play', playRouter);


const { is_alpha_num, no_whitespace, hash, generateAccessToken, getHTML } = require('./misc');

// Basic routes

app.get('/', async (req, res) => { 
    return res.status(200).send(await getHTML('index.html'));
});

app.get('/signup', redirectUser, async (req, res)=> {   
    return res.status(200).send(await getHTML('signup.html'));
});

app.get('/login', redirectUser, async (req, res)=> {   
    return res.status(200).send(await getHTML('login.html'));
});

app.get('/user', private, async (req, res)=> {   
    return res.status(200).send(await getHTML('user.html'));
});

app.get('/lb', private, async (req, res)=> {   
    return res.status(200).send(await getHTML('lb.html'));
});


// handle POST requests

app.post('/signup', async (req, res) => {

    const db = get_db();

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
        const [query_result1, fields1, err1] = await db.execute(sql1, [username]);

        const sql2 = "select email from users where email=?";
        const [query_result2, fields2, err2] = await db.execute(sql2, [email]);

        const sql3 = "SELECT Count(*) FROM users;";
        const [query_result3, fields3, err3] = await db.execute(sql3);
        
        // const num_users = query_result3['Count(*)'];

        const num_users = Object.values(query_result3[0])[0];

        console.log('Here is db query for count:', query_result3);
        console.log('Here is number of users:', num_users);

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
                
            const [query_result1, fields1, err1] = await db.execute(sql1, [username, hashedPassword, email, 1000, '#' + Math.floor(Math.random()*(2**24)).toString(16).padStart(6, '0'), num_users + 1]);            

            // fetch data from database

            const sql2 = 'select username, id, tank_color from users where username=?';    
            const [query_result2, fields2, err2] = await db.execute(sql2, [username]);            

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

    const db = get_db();

    // parse JSON body 
    console.log(req.body);
    const username = req.body.username.toString();
    console.log(username);
    const password = req.body.password.toString();
    console.log(password);

    // authenticate user    

    try {

        const sql = "SELECT id, username, hashed_password, tank_color FROM users WHERE username=?";

        const [query_result, fields, err] = await db.execute(sql, [username]);

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

            // console.log('Trying to authenticate user', username, 'with password', password);        
            // console.log('Correct password is', q.hashed_password);
                        
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


app.use(async function (req, res) {
    return res.status(404).send(await getHTML('404.html'));
});

app.use(async function (req, res) {
    return res.status(401).send(await getHTML('401.html'));
});

app.use(async function (req, res) {
    return res.status(403).send(await getHTML('403.html'));
});


let db;

// Start server
app.listen(port, async () => {    
    db = await sql_connect();
    
    console.log(`Server started at http://localhost:${port}`);
});