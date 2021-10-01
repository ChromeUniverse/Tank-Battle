const pool = require("../sql_util");

function sort_players_by_rating(p1, p2) {
  if (p1.elo < p2.elo) return +1;
  if (p1.elo == p2.elo) return 0;
  if (p1.elo > p2.elo) return -1;
}

async function update_leaderboard(){
  
  // fetch list of players from database

  const sql1 = 'SELECT username, elo, lb_rank from users';
  const [players, fields] = await pool.query(sql1);

  // const players = [
  //   { username: 'Lucca', elo: 1060, lb_rank: 1 },
  //   { username: 'RazorDMG', elo: 1000, lb_rank: 2 },
  //   { username: 'Lucca2', elo: 990, lb_rank: 3 },
  //   { username: 'Lucca3', elo: 998, lb_rank: 4 },
  //   { username: 'Lucca4', elo: 952, lb_rank: 5 },
  //   { username: 'Lucca6', elo: 1000, lb_rank: 6 },
  //   { username: 'Lucca7', elo: 1000, lb_rank: 7 },
  // ]
    
  // sort them by elo rating
  players.sort((p1, p2) => sort_players_by_rating(p1,p2));

  // assign new leaderboard ranking to players
  for (let i = 0; i < players.length; i++) {
    p = players[i];
    p.lb_rank = i+1;
  }

  // write new leaderboard ranks to database

  for (const p of players) {
    const sql = 'UPDATE users SET lb_rank = ? WHERE username = ?';
    const [rows, fields] = await pool.query(sql, [p.lb_rank, p.username]);
  }

  // console.log('Ranked list!', players);

}

// update_leaderboard();


module.exports = {
  update_leaderboard,
}