const jwt = require('jsonwebtoken');
const { get_db } = require("../sql_util");
const { getHTML } = require('../misc');

// "private" middleware
// -> only allows logged in users to access a specfic resource

async function private(req, res, next) {

  const db = get_db();

  let accessToken;

  console.log('Got private request.')

  // console.log('Here is cookies:', req.cookies);

  if (req.cookies.token !== undefined) {
    // get token and put it in the request object
    accessToken = req.cookies.token;
    req.token = accessToken;
  }
  else {
    return res.status(401).send(await getHTML('401.html'));
  }

  // verify token
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, userObject) => {

    // error while verifying
    if (err) {      
      return res.status(403).send(await getHTML('403.html'));
    }

    const sql = 'select id from users where username = ?';

    const [results, fields, e] = await db.execute(sql, [userObject.username]);

    if (results.length > 0) {
      // user exists
      req.user = userObject;
      return next();

    } else {
      // user doesn't exist      
      return res.status(403).send(await getHTML('403.html'));
    }

  });
}


module.exports = { private };