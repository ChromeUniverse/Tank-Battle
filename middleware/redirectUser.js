const jwt = require('jsonwebtoken');
const { get_db } = require("../sql_util");
const { readFile } = require('fs/promises');

// fs
const path_to_htmls = '/home/lucca/Documents/Programming/tank_battle/private/html/';

// "redirectUser" middleware
// -> redirects logged in users to home page

function redirectUser(req, res, next) {

  const db = get_db();

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
      const file = await readFile(path_to_htmls + '403.html', 'UTF-8');
      return res.status(403).send(file.toString());
    }

    req.user = userObject;

    const sql = 'select id from users where username = ?';

    const [results, fields, e] = await db.execute(sql, [userObject.username]);

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