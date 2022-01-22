// Package imports
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const favicon = require('serve-favicon');
require('dotenv').config();
const cors = require('cors');

// Custom module function imports
const { private } = require('./middleware/private');
const { getHTML } = require('./misc');

// 
// set up Express and middleware
// 

const app = express();
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:5000']
}));
app.use(cookieParser());
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

// basic routes -> return HTMLs

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
// Web server started!
// 

app.listen(PORT, async () => {    
    console.log(`Server listening on http://localhost:${PORT}`);
});