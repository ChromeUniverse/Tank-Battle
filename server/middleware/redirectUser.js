// Package imports
const jwt = require('jsonwebtoken');

// Custom module function imports
const pool = require("../sql_util");
const { getHTML } = require('../misc');

// "redirectUser" middleware
// -> redirects logged in users to home page

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
      return res.status(403).send(await getHTML('403.html'));
    }

    req.user = userObject;

    const sql = 'select id from users where username = ?';

    const [results, fields, e] = await pool.query(sql, [userObject.username]);

    if (results.length > 0) {
      // user exists
      // req.user = userObject; 
      return res.redirect('/');

    } else {      
      return next();
    }

  });
}

module.exports = { redirectUser };