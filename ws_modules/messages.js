const { get_rooms } = require("./ws_utils");

function send_to_room(roomname, message){
  const room = get_rooms()[roomname];

  for (const client of Object.values(room.spectators)) {
    client.send(JSON.stringify(message));
  }
}

function send_bullet_explode(roomname, x, y) {

  const message = {
    type: 'animation',
    animation: 'bullet-explode',
    x: x,
    y: y
  };

  send_to_room(roomname, message);
}

function send_player_explode(roomname, x, y) {
  
  const message = {
    type: 'animation',
    animation: 'player-explode',
    x: x,
    y: y
  };

  send_to_room(roomname, message);
}

function send_match_state(roomname){

  const rooms = get_rooms();
  const room = rooms[roomname];

  const message = {
    type: 'match-update',
    state: room.meta.state,
  };

  send_to_room(roomname, message);
}

function send_room_state_to_spectator(ws) {

  const rooms = get_rooms();
  const room = rooms[ws.room];

  const message = {
    type:'match-update',
    state: room.meta.state
  }

  ws.send(JSON.stringify(message));
}


function send_room_full(ws) {
  const message = {
    type:'room-full',
    message: 'Room is full!!! Please wait.'
  }

  ws.send(JSON.stringify(message));
}

function send_match_in_progress(ws) {
  const message = {
    type:'match-in-progress',
    message: 'Match in progress!!! Please wait.'
  }

  ws.send(JSON.stringify(message));
}

function send_time(time,roomname) {
  const message = {
    type:'time',
    message: time.toString() + '...'
  };

  console.log('Sending time!', time);

  send_to_room(roomname, message);
}

function send_kill(roomname, killer, dead) {
  const message = {
    type:'kill',
    killer_name: killer.name,
    killer_color: killer.color,
    dead_name: dead.name,
    dead_color: dead.color,
  }

  send_to_room(roomname, message);
}

function send_win(roomname, winner) {
  const message = {
    type:'win',
    winner_name: winner.name,
    winner_color: winner.color,
  }

  send_to_room(roomname, message);
}


module.exports = {
  send_bullet_explode,
  send_player_explode,
  send_match_state,
  send_room_full,
  send_room_state_to_spectator,
  send_match_in_progress,
  send_time,
  send_kill,
  send_win,
}