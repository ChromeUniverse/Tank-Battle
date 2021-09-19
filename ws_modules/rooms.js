const { get_rooms, get_players, set_players } = require("./ws_utils");
const { createObstables } = require('./obstacle');

// sends JSON with a list of active rooms
function get_rooms_list(ws) {

  let rooms = get_rooms();

  // create list of room objects to send
  let rooms_list = Object.keys(rooms).map(room_name => {
    return { name: room_name }
  });

  // send list of rooms to client
  ws.send( JSON.stringify( { type: "rooms-list", rooms_list: rooms_list } ));

}

// create and add a new room to 'rooms' object
function createRoom(roomname) {

  let rooms = get_rooms();

  const newroom = {
    meta: {},
    spectators: {},
    players: {},
    bullets: {},
    map: createObstables(),
  }

  rooms[roomname] = newroom;

  console.log(rooms);
}


// looping over 'rooms' container to find and remove empty rooms
function remove_empty_rooms() {
  let rooms = get_rooms();
  for (const [roomName, roomObject] of Object.entries(rooms)) {
    if (Object.keys(roomObject.spectators).length == 0 ) {
      console.log('removing empty room:', roomName);
      delete rooms[roomName];
    }
  }
}

// add/remove spectator logic
function add_spectator(ws) {

  let rooms = get_rooms();

  if (!rooms.hasOwnProperty(ws.room)) createRoom(ws.room);
  rooms[ws.room].spectators[ws.id] = ws;

  console.log('\nAdded spectator! here\'s rooms:\n');
  console.log(rooms);
}

function remove_spectator(ws) {
  let rooms = get_rooms();
  delete rooms[ws.room].spectators[ws.id];
}

// add/remove player logic
function add_player(ws) {
  
  let players = get_players();
  let rooms = get_rooms();

  // new tank params
  ws.x = 0;
  ws.y = 0;
  ws.heading = 0;
  ws.aim = 0; 

  if (!rooms.hasOwnProperty(ws.room)) createRoom(ws.room);
  rooms[ws.room].players[ws.id] = ws;

  players.push(ws.name);
}

function remove_player(ws) {
  let rooms = get_rooms();
  let players = get_players();

  delete rooms[ws.room].players[ws.id];
  set_players(players.filter(name => name != ws.name));
}

module.exports = {
  get_rooms_list,
  createRoom, 
  remove_empty_rooms, 
  add_spectator, 
  remove_spectator, 
  add_player, 
  remove_player
};
