const { get_rooms } = require("./ws_utils");

function send_game_state_to_clients() {

  let rooms = get_rooms();

  // looping over rooms
  for (const [roomName, roomObject] of Object.entries(rooms)) {

    // preparing roomobject to send
    // let room_to_send = {};
    
    // list of clients
    const clients = Object.values(roomObject.spectators);

    // building players object to send
    let players_to_send = {};
    
    for (const [id, p] of Object.entries(roomObject.players)) {
      players_to_send[id] = { 
        name: p.name,
        color: p.color,
        x: p.x, 
        y: p.y, 
        heading: p.heading, 
        aim: p.aim 
      }
    };

    // room_to_send.players = players;


    // building players object to send
    let bullets_to_send = [];
    
    for (const b of roomObject.bullets) {
      let bullet_to_send = { x: b.x, y: b.y, name: b.name, color: b.color };
      bullets_to_send.push(bullet_to_send);
    };

    // room_to_send.bullets = bullets;


    // sending room state to all clients in room
    for (const client of clients) {
      client.send(JSON.stringify(
        { 
          type: 'room-update',
          players: players_to_send,
          bullets: bullets_to_send
        } 
      ));
    }

  }
};

module.exports = { send_game_state_to_clients };