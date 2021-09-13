// Package imports
const express = require('express');
const bcrypt = require('bcrypt');


// Custom module function imports
const { redirectUser } = require('../middleware/redirectUser');
const { generateAccessToken, getHTML } = require('../misc');
const { get_db } = require('../sql_util');

// Express Router setup
const router = express.Router();
router.use(redirectUser);

//
// GET /login     --> send webpage
// 

router.get('/', async (req, res)=> {   
  return res.status(200).send(await getHTML('login.html'));
});

//
// POST /login    --> user authentication logic
// 

router.post('/', async (req, res) => {

  const db = get_db();

  // parse JSON body 
  const username = req.body.username.toString();
  const password = req.body.password.toString();

  // authenticate user    

  try {

    // sql query - checking given credentials against database records

    const sql = "SELECT id, username, hashed_password, tank_color FROM users WHERE username=?";

    const [query_result, fields, err] = await db.execute(sql, [username]);

    if (query_result.length > 0) {

      // found at least one result
      
      // Return data:
      // 
      // BinaryRow {
      //     username: 'Lucca',
      //     elo: 1000,
      //     lb_rank: 1,
      //     tank_color: 16711935
      //   }

      const q = query_result[0]

      // Trying to authenticate: username, password

      const match = await bcrypt.compare(password, q.hashed_password);

      if (match) {

        // auth match!

        console.log('Match!');

        // generate jwt access token  
        const user = { username: q.username, userID: q.id, tankColor: q.tank_color };
        const accessToken = generateAccessToken(user);

        const json = { error: false, message: 'Success!' };

        res
          .status(200)
          .cookie('token', accessToken, { httpOnly: true })
          .json(json);
        return;


      } else {

        // auth failed!

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

      // no results

      console.log('user not found');

      res.status(401);
      res.json({
        error: true,
        message: 'Incorrect username.'
      });
      return;

    }

  }

  catch (e) {

    // Something went wrong
    
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