const { shuffle } = require("../misc");
const { min_players, pre_match_time, post_match_time, spawn1, spawn2, spawn3, spawn4, spawn5, spawn6 } = require("./constants");
const { send_match_state, send_time, send_win } = require("./messages");
const { get_num_players, get_num_players_alive } = require("./rooms");
const { get_rooms } = require("./ws_utils")


function update_match_state(){
  let rooms = get_rooms();

  for (let [roomname, roomObject] of Object.entries(rooms)) {
    
    let state = roomObject.meta.state;
    let update = roomObject.meta.last_update_time;


    // at least 'min_players' people join the room
    if (state == 'waiting' && get_num_players(roomname) >= min_players) {

      console.log('\nMOVED TO PRE-MATCH!\n');

      // move to pre-match
      roomObject.meta.state = 'pre-match';
      roomObject.meta.last_update_time = Date.now();
      send_match_state(roomname);

    }

    // number of people in room drops below 'min_players'
    if ( state == 'pre-match' && get_num_players(roomname) < min_players ) {

      console.log('\nBACK TO WAITING\n');

      // move back to 'waiting' state
      roomObject.meta.state = 'waiting';
      roomObject.meta.last_update_time = Date.now();
      send_match_state(roomname);

    } 

    // waiting in pre-match...
    if ( state == 'pre-match' && Date.now() - update < pre_match_time * 1000 ) {

      if (Date.now() - update > pre_match_time * 1000 - 3000 && Date.now() - update < pre_match_time * 1000 - 2000) { send_time(3, roomname) }
      if (Date.now() - update > pre_match_time * 1000 - 2000 && Date.now() - update < pre_match_time * 1000 - 1000) { send_time(2, roomname) }
      if (Date.now() - update > pre_match_time * 1000 - 1000) { send_time(1, roomname) }

    } 

    // waiting in pre-match for over 'pre_match_time' seconds
    if ( state == 'pre-match' && Date.now() - update > pre_match_time * 1000 ) {

      console.log('\nGAME START!\n');

      // start game
      roomObject.meta.state = 'playing';
      roomObject.meta.last_update_time = Date.now();
      send_match_state(roomname);
    } 

    // last man standing
    if ( state == 'playing' && get_num_players_alive(roomname) == 1) {

      console.log('\nGAME OVER!!!\n');

      // game over!
      roomObject.meta.state = 'post-match';
      roomObject.meta.last_update_time = Date.now();
      send_match_state(roomname);
    }

    // waiting in post-match for over 'post_match_time' seconds
    if ( state == 'post-match' && Date.now() - update > post_match_time * 1000) {

      console.log('\nPOST-MATCH OVER, BACK TO WAITING!\n');

      // set state to 'waiting'
      roomObject.meta.state = 'waiting';
      roomObject.meta.last_update_time = Date.now();

      // delete all bullets 
      roomObject.bullets = [];

      roomObject.meta.spawns = shuffle([spawn1, spawn2, spawn3, spawn4, spawn5, spawn6]);
      // console.log('Fetching:', spawn_points);
      // console.log('Shhuffling:', shuffle(spawn_points));
      console.log('Spawn locations after match end:', roomObject.meta.spawns);

      // reset players
      for (let player of Object.values(roomObject.players)) {
        player.hit = false;     // revive players 
        
        // move players back to spawn points

        let spawn = roomObject.meta.spawns.shift();

        player.spawn = spawn;
        player.x = spawn[0];           
        player.y = spawn[1];

        player.heading = 0;     // reset tank heading and turret angle 
        player.aim = 0;
      }

      send_match_state(roomname);

    }

    if ( state == 'post-match' && Date.now() - update > 1000 && Date.now() - update < 2000 ) {
      let winner = Object.values(roomObject.players).filter(p => !p.hit)[0];
      send_win(roomname, winner);
      console.log(winner.name, 'wins!');
    }

  }

}


module.exports = {
  update_match_state
}