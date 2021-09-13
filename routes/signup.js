// Package imports
const express = require('express');
const validator = require('validator');


// Custom module function imports
const { redirectUser } = require('../middleware/redirectUser');
const { is_alpha_num, no_whitespace, hash, generateAccessToken, getHTML } = require('../misc');
const { get_db } = require('../sql_util');

// Express Router setup
const router = express.Router();
router.use(redirectUser);

//
// GET /signup    --> send webpage
// 

router.get('/', async (req, res)=> {   
  return res.status(200).send(await getHTML('signup.html'));
});

//
// POST /signup   --> user authentication logic
// 

router.post('/', async (req, res) => {

  const db = get_db();

  console.log('Got signup POST');

  // parse JSON body 
  console.log(req.body);
  const email = req.body['email'].toString();
  const username = req.body['username'].toString();
  const password = req.body['password'].toString();
  const password2 = req.body['password2'].toString();


  // 
  // Preliminary input validity checks:
  //

  let isEmailValid = validator.isEmail(email);
  let isUsernameValid = is_alpha_num(username) && (username.length < 25);
  let isPasswordValid = no_whitespace(password) && (password.length < 100);

  if (!isEmailValid) {
    console.log('Invalid email.');
    return res.status(400).json(
      { status: 'error', message: 'Invalid Email.' }
    );
  }

  if (!isUsernameValid) {
    console.log('Invalid username.');
    return res.status(400).json(
      { status: 'error', message: 'Invalid username. Only alphanumeric chars are allowed!' }
    );
  }

  if (!isPasswordValid) {
    console.log('Invalid password.');
    return res.status(400).json(
      { status: 'error', message: 'Invalid password.' }
    );
  }

  if (password !== password2) {
    console.log('Passwords don\'t match.');
    return res.status(400).json(
      { status: 'error', message: 'Passwords don\'t match.' }
    );
  }

  //
  // Passed preliminary validity checks!
  //

  //
  // Secondary input validity checks:
  //

  try {

    // sql queries - search for given username, email in db
    const sql1 = "SELECT username FROM users WHERE username=?";
    const [query_result1, fields1, err1] = await db.execute(sql1, [username]);

    const sql2 = "SELECT email FROM users WHERE email=?";
    const [query_result2, fields2, err2] = await db.execute(sql2, [email]);

    // sql query - get the number of users
    const sql3 = "SELECT Count(*) FROM users;";
    const [query_result3, fields3, err3] = await db.execute(sql3);
    const num_users = Object.values(query_result3[0])[0];

    console.log('Here is db query for count:', query_result3);
    console.log('Here is number of users:', num_users);

    if (query_result1.length > 0) {

      //
      // username already exists!
      //

      console.log('username taken');

      const json = {
        error: true,
        message: 'That username was already taken.'
      }
      return res.status(403).json(json);
    }

    else if (query_result2.length > 0) {

      //
      // email already exists!
      //

      console.log('email taken');

      const json = {
        error: true,
        message: 'Email already registered.'
      }
      return res.status(403).json(json);
    }

    else {

      //
      // Passed all input validity checks!!
      // Ready to write new user data to database.
      //

      // hash & salt input password
      const hashedPassword = await hash(password);

      // assign values for new user
      const elo = 1000;
      const tank_color = '#' + Math.floor(Math.random() * (2 ** 24)).toString(16).padStart(6, '0');
      const lb_rank = num_users + 1;

      // write new user data to db
      const sql1 = 'INSERT INTO users (username, hashed_password, email, elo, tank_color, lb_rank) VALUES (?, ?, ?, ?, ?, ?);';
      const [query_result1, fields1, err1] = await db.execute(sql1, [username, hashedPassword, email, elo, tank_color, lb_rank]);

      // Generate access token for new user
      const user = { username: username, userID: lb_rank, tankColor: tank_color };
      const accessToken = generateAccessToken(user);
      
      // Send it to new user
      res.status(200)
      res.cookie('token', accessToken, { httpOnly: true })
      res.json({
          error: false,
          message: 'Success! New user created.'
      });
      return;
    }
  }

  catch (e) {

    // Something went wrong!

    res.status(500);
    res.json({
      error: true,
      message: 'Server Error'
    });
    console.error(e);
    return;
  }
});

module.exports = router;