const { get_rooms } = require("./ws_utils");

function send_game_state_to_clients() {

  let rooms = get_rooms();

  // looping over rooms
  for (const [roomName, roomObject] of Object.entries(rooms)) {

    // preparing roomobject to send
    let room_to_send = {};
    
    // list of clients
    const clients = Object.values(roomObject.spectators);

    let players = {};

    // filtering out
    for (const [id, p] of Object.entries(roomObject.players)) {
      players[id] = { 
        name: p.name,
        color: p.color,
        x: p.x, 
        y: p.y, 
        heading: p.heading, 
        aim: p.aim 
      }
    };

    room_to_send.players = players;

    // sending room state to all clients in room
    for (const client of clients) {
      client.send(JSON.stringify(
        { 
          type: 'room-update',
          room: room_to_send
        } 
      ));
    }

  }
};

module.exports = { send_game_state_to_clients };