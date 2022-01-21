// package imports
const mysql = require('mysql2/promise');
require('dotenv').config();

// exporting MySQL connection pool object
module.exports = mysql.createPool({
  host: 'localhost',
  user: 'lucca',
  password: process.env.MYSQL_PASSWORD,
  database: 'tank_battle',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
})

