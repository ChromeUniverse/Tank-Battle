// module imports
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');


// set up express app
const app = express();
app.use(cors(
    { origin: ["http://localhost:4000", "http://localhost:5000"] }
));
app.use(express.json());
app.use(express.static('public'));
const port = 5000;

let refreshTokens = [];

// fs
const path_to_htmls = __dirname + '/public/html/';


// auth functions


function generateAccessToken(user) {
    // return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '25s'});
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
}


function authenticateToken(req, res, next) { 
    const authHeader = req.headers['authorization'];
    
    let token;

    // got auth header -> get token
    if (authHeader !== undefined) { token = authHeader.split(' ')[1]; } 

    // no auth header -> send regular page
    else { return res.sendStatus(401); }

    // verify token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user; 
        next();      
    });
}




// Routes

app.post('/token', (req, res) => {
    const refreshToken = req.body.token;

    if (refreshToken === undefined) return res.sendStatus(401);

    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateAccessToken({name: user.username, userID: 123456});
        res.json(accessToken);
    });
});

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
});


app.get('/login', (req, res)=> {  
    
    res.status(200);        
    return res.send(fs.readFileSync(path_to_htmls + 'login.html', 'UTF-8').toString());         

    // let auth = authenticateToken(req, res);

    // let statusCode = auth[0];
    // req = auth[1];
    // res = auth[2];

    // if (statusCode == 401) {
    //     res.status(401);        
    //     return res.send(fs.readFileSync(path_to_htmls + 'login.html', 'UTF-8').toString());         
    // }
    // if (statusCode == 403) {
    //     res.status(403);
    //     return res.send('Login error!');         
    // }
    // if (statusCode == 200) {
    //     res.status(302);
    //     return res.redirect('/');
    // }
});


app.get('/api/*', authenticateToken, (req, res) => {

    let endpoint = req.url.substr(5);
    console.log("Got request here:", endpoint);

    if (endpoint == 'login') {
        res.status(302);
        res.redirect('http://localhost:4000/');
        return;
    }
}); 


app.post('/login', (req, res) => {

    // parse body 

    console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;

    // authenticate user

    if (username != 'Lucca' || password != '123') {
        return res.status(403).send('Wrong credentials!');
    }

    // send jwt access token

    const user = { username: username, password: password };

    const accessToken = generateAccessToken(user);
    
    // const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    // refreshTokens.push(refreshToken);

    // res.status(200).json({accessToken: accessToken, refreshToken: refreshToken});
    res.status(200).json({accessToken: accessToken});
    return;
});



// Start server
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});