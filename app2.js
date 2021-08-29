// module imports
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
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

const port = 4000;




// fs
const path_to_htmls = __dirname + '/private/html/';

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
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, userObject) => {

        // error while verifying
        if (err) {            
            return res.status(403).send(fs.readFileSync(path_to_htmls + '403.html', 'UTF-8').toString());
        }

        const sql = 'select id from users where username = ?';

        const [results, fields, e] = await app.db.execute(sql, [userObject.username]);

        if (results.length > 0) {
            // user exists
            req.user = userObject; 
            return next();  

        } else {
            // user doesn't exist
            return res.status(403).send(fs.readFileSync(path_to_htmls + '403.html', 'UTF-8').toString());
        }
                            
    });
}

function redirectUser(req, res, next) {   
    
    let accessToken;

    console.log('Here is cookies:', req.cookies);

    if (req.cookies.token !== undefined) {
        accessToken = req.cookies.token
    } 
    else { 
        return next();
    }


    // verify token
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, userObject) => {

        // error while verifying
        if (err) {            
            return res.status(403).send(fs.readFileSync(path_to_htmls + '403.html', 'UTF-8').toString());
        }

        req.user = userObject;

        const sql = 'select id from users where username = ?';

        const [results, fields, e] = await app.db.execute(sql, [userObject.username]);
        
        if (results.length > 0) {
            // user exists
            // req.user = userObject; 
            return res.redirect('/');

        } else {
            // user doesn't exist
            // return res.status(403).send(fs.readFileSync(path_to_htmls + '403.html', 'UTF-8').toString());
            return next();
        }

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



// API GET requests

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

    if (endpoint == 'lb') {

        const name = JSON.parse(atob(req.token.split('.')[1])).username.toString();
        // const name = 'qrno';

        // sorting by descending lb_rank

        const sql = "SELECT username, elo, lb_rank FROM users ORDER BY lb_rank ASC;";

        try {
            const [query_result, fields, err] = await app.db.execute(sql, [name]);

            if (query_result.length > 0) {

                console.log(query_result);
                console.log(err);                

                res.status(200);
                res.json({lb: query_result}); 
                return;

            } else {
                console.log('LEADERBOARD ERROR');

                res.status(500);
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

    else {
        res.status(404);
        res.send({
            error: true,
            message: 'API endpoint nonexistent.'
        });
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

        const sql3 = "SELECT Count(*) FROM users;";
        const [query_result3, fields3, err3] = await app.db.execute(sql3);
        
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
                
            const [query_result1, fields1, err1] = await app.db.execute(sql1, [username, hashedPassword, email, 1000, '#' + Math.floor(Math.random()*(2**24)).toString(16).padStart(6, '0'), num_users + 1]);            

            // fetch data from database

            const sql2 = 'select username, id, tank_color from users where username=?';    
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

        const sql = "SELECT id, username, hashed_password, tank_color FROM users WHERE username=?";

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


// Send logged-in users to room

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

app.use(function (req, res) {
    res.status(401).send(fs.readFileSync(path_to_htmls + '401.html').toString());
});

app.use(function (req, res) {
    res.status(403).send(fs.readFileSync(path_to_htmls + '403.html').toString());
});




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