// module imports
const express = require("express");
const atob = require('atob');
const { private } = require('../middleware/private');
const { get_db } = require('../sql_util');

// Express Router setup
const router = express.Router();
router.use(private);

// GET /user    --> returns user information
router.get('/user', async (req, res) => {
  
  const db = get_db(); 

  const name = JSON.parse(atob(req.token.split('.')[1])).username.toString();
  const sql = "select username, elo, lb_rank, tank_color from users where username=?"

  try {
    const [query_result, fields, err] = await db.execute(sql, [name]);

    if (query_result.length > 0) {

      console.log(query_result);
      console.log(err);
      const q = query_result[0]

      // BinaryRow {
      //     username: 'Lucca',
      //     elo: 1000,
      //     lb_rank: 1,
      //     tank_color: 16711935
      //   }

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

  const db = get_db();

  const name = JSON.parse(atob(req.token.split('.')[1])).username.toString();
  // const name = 'qrno';

  // sorting by descending lb_rank

  const sql = "SELECT username, elo, lb_rank FROM users ORDER BY lb_rank ASC;";

  try {
    const [query_result, fields, err] = await db.execute(sql, [name]);

    if (query_result.length > 0) {

      console.log(query_result);
      console.log(err);

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

// Get /secret  --> returns shenanigans
router.get('/secret', async (req,res) => {
  const text = "You're a sneaky one, aren't you? If you've managed to reach this endpoint, send me a DM to get a prize! Discord: Lucca hash-two-seven-four-four";
  return res.status(418).json({error: false, message: text});
});

module.exports = router;