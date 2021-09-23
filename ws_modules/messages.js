const { get_rooms } = require("./ws_utils");

function send_to_room(roomname, message){
  const room = get_rooms()[roomname];

  for (const client of Object.values(room.spectators)) {
    client.send( JSON.stringify(message));
  }
}

function send_bullet_explode(roomname, x, y) {

  const message = {
    type: 'animation',
    animation: 'bullet-explode',
    x: x,
    y: y
  }

  send_to_room(roomname, message);
}

function send_player_explode(roomname, x, y) {
  
  const message = {
    type: 'animation',
    animation: 'player-explode',
    x: x,
    y: y
  }

  send_to_room(roomname, message);
}




module.exports = {
  send_bullet_explode,
  send_player_explode,
}