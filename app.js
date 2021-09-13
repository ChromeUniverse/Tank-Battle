// Package imports
const express = require('express');
const cookieParser = require('cookie-parser')
require('dotenv').config();

// Custom module function imports
const { sql_connect } = require('./sql_util');
const { private } = require('./middleware/private');
const { getHTML } = require('./misc');


// 
// set up Express and middleware
// 

const app = express();
app.use(cookieParser())
app.use(express.static('public'));
app.use(express.json());

const PORT = 4000;

// 
// Define routes for Express Router
// 


// API
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

// logout
const logoutRouter = require('./routes/logout');
app.use('/logout', logoutRouter);

// game room
const playRouter = require('./routes/play');
app.use('/play', playRouter);

// signup
const signupRouter = require('./routes/signup');
app.use('/signup', signupRouter);

// login
const loginRouter = require('./routes/login');
app.use('/login', loginRouter);

// basic routes

app.get('/', async (req, res) => { 
    return res.status(200).send(await getHTML('index.html'));
});

app.get('/user', private, async (req, res)=> {   
    return res.status(200).send(await getHTML('user.html'));
});

app.get('/lb', private, async (req, res)=> {   
    return res.status(200).send(await getHTML('lb.html'));
});


// 
// Start web server
// 

app.listen(PORT, async () => {    
    await sql_connect();
    console.log(`Server listening on http://localhost:${PORT}`);
});