const pool = require('../sql_util');
const { k_factor } = require('./constants');
const { update_leaderboard } = require('./leaderboard');


// Simple Multiplayer Elo - algorithm courtesy of Tom Kerrigan
// http://www.tckerrigan.com/Misc/Multiplayer_Elo/


// expected score for player1 in a match of player1 vs. player 
function get_expected(rating1, rating2){
  const expected = 1 / ( 1 + 10 ** ((rating2 - rating1)/400) );
  return expected;
}

// get new
function new_ratings(player1, player2){

  console.log('Got here!!!');

  // get current ratings
  const current1 = player1.rating;
  const current2 = player2.rating;

  console.log('\nCalculating new ratings for', player1.name, '-', current1, 'and', player2.name, '-', current2);

  // get expected scores
  const expected1 = get_expected(current1, current2);
  const expected2 = get_expected(current2, current1);

  console.log('\nExpected score for', player1.name, expected1);
  console.log('Expected score for', player2.name, expected2);

  let score1;
  let score2;

  if ( player1.rank < player2.rank ) { 
    //  player 1 wins 
    score1 = 1;
    score2 = 0;
  } else if ( player1.rank > player2.rank ) { 
    //  player 2 wins 
    score1 = 0;
    score2 = 1;
  }

  // calculate and return new ratings
  const newrating1 = Math.round(current1 + k_factor * ( score1 - expected1 ));
  const newrating2 = Math.round(current2 + k_factor * ( score2 - expected2 ));

  console.log('Old rating for', player1.name, ':', current1);
  console.log('Old rating for', player2.name, ':', current2);

  console.log('New rating for', player1.name, ':', newrating1);
  console.log('New rating for', player2.name, ':', newrating2);

  return [newrating1, newrating2];
}




function probability(n){
  return Math.random() < n;
}


function new_ratings_alt(player1, player2){

  // get current ratings
  const current1 = player1.rating;
  const current2 = player2.rating;

  // get expected scores
  const expected1 = get_expected(current1, current2);
  console.log('\nExpected score for player1:', expected1);
  const expected2 = get_expected(current2, current1);
  console.log('Expected score for player2:', expected2, '');

  let score1;
  let score2;

  // let p1_wins = probability(0.7);
  if (player1.rank < player2.rank) { 
    console.log('player 1 wins!\n'); 
    score1 = 1;
    score2 = 0;
  }
  
  if (player1.rank > player2.rank ) { 
    console.log('player 2 wins!\n');
    score1 = 0;
    score2 = 1;
  }
  

  // calculate and return new ratings
  const newrating1 = current1 + k_factor * ( score1 - expected1 );
  const newrating2 = current2 + k_factor * ( score2 - expected2 );

  console.log('Old rating for', player1.name, ':', current1);
  console.log('Old rating for', player2.name, ':', current2);

  console.log('New rating for', player1.name, ':', newrating1);
  console.log('New rating for', player2.name, ':', newrating2);

  return [newrating1, newrating2];
}


// fetch player's current rating from database
async function get_rating(player) {  
  const [result, fields] = await pool.query('SELECT elo FROM users WHERE username = ?', [player.name]);
  return result[0].elo;
}

// update player's current rating
async function set_rating(player, newrating) {
  const sql = 'UPDATE users SET elo = ? WHERE username = ?'
  const [query_result, fields, err] = await pool.query(sql, [newrating, player.name]);
}

function order(p1, p2) {
 if (p1.rank <  p2.rank) return -1;
 if (p1.rank == p2.rank) return 0;
 if (p1.rank >  p2.rank) return +1;
}


function update_ratings_in_room(players){

  let players_ranked = Object.values(players).sort((p1,p2) => order(p1,p2));

  // top-down!

  for (let i = 0; i < players_ranked.length-1; i++) {

    let p1 = players_ranked[i];
    let p2 = players_ranked[i+1];

    console.log('Now running elo simulation for players', p1.name, 'and', p2.name, '...');

    const [ newrating1, newrating2 ] = new_ratings(p1, p2);
    
    p1.rating = newrating1;
    p2.rating = newrating2;
  }  

  players_ranked.forEach(async (p) => {
    const newrating = p.rating;
    console.log('New rating for player', p.name,'-', newrating);
    set_rating(p, newrating);
  });

  update_leaderboard();
}


module.exports = {
  get_rating, 
  update_ratings_in_room,
}