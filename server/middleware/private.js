// Package imports
const jwt = require('jsonwebtoken');

// Custom module function imports
const pool = require("../sql_util");
const { getHTML } = require('../misc');

// "private" middleware
// -> only allows logged in users to access a specfic resource

async function private(req, res, next) {

  let accessToken;

  console.log('Got private request.')

  // got token -> attach it to request object
  if (req.cookies.token !== undefined) {
    accessToken = req.cookies.token;
    req.token = accessToken;
  }

  // no token -> send 401 Unauthorized
  else return res.status(401).send(await getHTML('401.html'));

  // verify token
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, userObject) => {

    // error while verifying -> 403 Forbidden
    if (err) return res.status(403).send(await getHTML('403.html'));

    const sql = 'select id from users where username = ?';

    const [results, fields, e] = await pool.query(sql, [userObject.username]);
    
    // user exists -> pass on
    if (results.length > 0) {
      console.log('Got here!');
      req.user = userObject;
      return next();
    } 
    // user doesn't exist -> return 403 Forbidden
    else return res.status(403).send(await getHTML('403.html'));

  });
}

// export middleware
module.exports = { private };