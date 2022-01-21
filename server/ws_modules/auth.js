const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config();

function auth(request) {

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const sql = 'SELECT username FROM users WHERE username=?'

  } catch (err) {
    console.log(err)
    return false;
  }
}

module.exports = { auth };