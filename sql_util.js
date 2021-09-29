const mysql = require('mysql2/promise');
require('dotenv').config();

let db;


// connect to MySQL database
async function sql_connect() {
  // connect to database
  db = await mysql.createConnection({
    host     : 'localhost',
    user     : 'lucca',
    password : process.env.MYSQL_PASSWORD, 
    database : 'tank_battle'
  });

  return db;
}

// get database object
function get_db() { return db; }

module.exports = {
  sql_connect,
  get_db,
}

  