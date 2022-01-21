// module imports
const express = require("express");
const { private } = require('../middleware/private');
const pool = require('../sql_util');
const jwt = require("jsonwebtoken");


// Express Router setup
const router = express.Router();
router.use(private);

// GET /user    --> returns user information
router.get('/user', async (req, res) => {

  const decoded = jwt.decode(req.token, {complete: true});
  const name = decoded.payload.username.toString();

  const sql = "select username, elo, lb_rank, tank_color from users where username=?"

  try {
    const [query_result, fields, err] = await pool.query(sql, [name]);

    if (query_result.length > 0) {

      console.log(query_result);
      const q = query_result[0]

      // BinaryRow {
      //   username: 'Lucca',
      //   elo: 1000,
      //   lb_rank: 1,
      //   tank_color: #12fca7
      // }

      const userData = {
        error: false,
        name: q.username,
        elo: q.elo,
        lb_rank: q.lb_rank,
        tank_color: q.tank_color
      }

      res.status(200);
      res.json(userData);
      return;

    } else {
      console.log('user not found');

      res.status(404);
      res.json({
        error: true,
        message: 'User not found'
      });

      return;
    }

  }

  catch (e) {
    res.status(500);
    res.json({
      error: true,
      message: 'Server Error'
    });
    console.error(e);
    return;
  }

});

// GET /lb      --> returns leaderboard
router.get('/lb', async (req, res) => {

  const decoded = jwt.decode(req.token, {complete: true});
  const name = decoded.payload.username.toString();

  // sorting by ascending leaderboard rank

  const sql = "SELECT username, elo, lb_rank FROM users ORDER BY lb_rank ASC;";

  try {
    const [query_result, fields, err] = await pool.query(sql, [name]);

    if (query_result.length > 0) {

      console.log(query_result);

      res.status(200);
      res.json({ error: false, lb: query_result });
      return;

    } else {
      console.log('LEADERBOARD ERROR');

      res.status(404);
      res.json({
        error: true,
        message: 'User not found'
      });
      return;
    }
  }

  catch (e) {
    res.status(500);
    res.json({
      error: true,
      message: 'Server Error'
    });
    console.error(e);
    return;
  }

});

// Get /secret  --> returns shenanigans :-P
router.get('/secret', async (req,res) => {
  const text = "You're a sneaky one, aren't you? If you've managed to reach this endpoint, send me a DM to get a prize! Discord: Lucca hash-two-seven-four-four";
  return res.status(418).json({error: false, message: text});
});

module.exports = router;