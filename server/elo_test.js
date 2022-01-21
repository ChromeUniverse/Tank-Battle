const { sql_connect } = require('./sql_util')
const { get_expected, get_rating, new_ratings, update_rating, new_ratings_alt } = require('./ws_modules/elo')

async function main () {
  await sql_connect()

  const player1 = {
    name: 'Lucca',
    rank: 1,
    rating: 1000
  }

  const player2 = {
    name: 'Lucca2',
    rank: 2,
    rating: 1000
  }

  const player3 = {
    name: 'Lucca3',
    rank: 3,
    rating: 1000
  }

  const player4 = {
    name: 'Lucca4',
    rank: 4,
    rating: 1000
  }

  // top-down:

  // let [ a, b ] = new_ratings_alt(player1, player2);
  // player1.rating = a;
  // player2.rating = b;

  // let [ c, d ] = new_ratings_alt(player2, player3);
  // player2.rating = c;
  // player3.rating = d;

  // let [ e, f ] = new_ratings_alt(player3, player4);
  // player3.rating = e;
  // player4.rating = f;

  // bottom-up

  const [a, b] = new_ratings_alt(player3, player4)
  player3.rating = a
  player4.rating = b

  const [c, d] = new_ratings_alt(player2, player3)
  player2.rating = c
  player3.rating = d

  const [e, f] = new_ratings_alt(player1, player2)
  player1.rating = e
  player2.rating = f

  console.log(player1.rating)
  console.log(player2.rating)
  console.log(player3.rating)
  console.log(player4.rating)
}

main()
