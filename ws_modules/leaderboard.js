const pool = require("../sql_util");

async function update_leaderboard(){

  // sorted list of players by decreasing elo rating
  const sql1 = 'SELECT username, elo, lb_rank FROM users ORDER BY elo DESC';
  let [players, fields] = await pool.query(sql1);

  // const players = [
  //   { username: 'Lucca', elo: 1060, lb_rank: 1 },
  //   { username: 'Lucca2', elo: 990, lb_rank: 3 },
  //   { username: 'Lucca3', elo: 998, lb_rank: 4 },
  // ]

  console.log('Sorted by decreasing elo:', players);

  // assign new leaderboard ranking to players
  for (let i = 0; i < players.length; i++) {
    p = players[i];
    p.lb_rank = i+1;
  }

  console.log('New leaderboard ranks:', players);

  // write new leaderboard ranks to database

  // -> possible async optimzation here:

  // for (const p of players) {
  //   const sql = 'UPDATE users SET lb_rank = ? WHERE username = ?';
  //   const [rows, fields] = await pool.query(sql, [p.lb_rank, p.username]);
  // }

  players.forEach(async (p) => {
    const sql = 'UPDATE users SET lb_rank = ? WHERE username = ?';
    const [rows, fields] = await pool.query(sql, [p.lb_rank, p.username]);
  });

  // console.log('Ranked list!', players);

}

// update_leaderboard();


module.exports = {
  update_leaderboard,
}