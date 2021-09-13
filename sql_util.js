const mysql = require('mysql2/promise');
require('dotenv').config();

let db;

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

module.exports.sql_connect = sql_connect;

function get_db() {return db}

module.exports.get_db = get_db;


  