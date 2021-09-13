const jwt = require('jsonwebtoken');
const { get_db } = require("../sql_util");
const { readFile } = require('fs/promises');

// fs
const path_to_htmls = '/home/lucca/Documents/Programming/tank_battle/private/html/';

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
    const file = await readFile(path_to_htmls + '401.html', 'UTF-8');
    res.status(401).send(file.toString());
    return;
  }

  // verify token
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, userObject) => {

    // error while verifying
    if (err) {
      const file = await readFile(path_to_htmls + '403.html', 'UTF-8');
      return res.status(403).send(file.toString());
    }

    const sql = 'select id from users where username = ?';

    const [results, fields, e] = await db.execute(sql, [userObject.username]);

    if (results.length > 0) {
      // user exists
      req.user = userObject;
      return next();

    } else {
      // user doesn't exist
      const file = await readFile(path_to_htmls + '403.html', 'UTF-8');
      return res.status(403).send(file.toString());
    }

  });
}


module.exports = { private };