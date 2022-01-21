const { get_rooms, get_players, set_players } = require("./ws_utils");
const { createObstables } = require('./obstacle');
const { spawn1, spawn2, spawn3, spawn4, spawn5, spawn6, max_players } = require("./constants");
const { send_room_full, send_room_state_to_spectator, send_match_in_progress } = require("./messages");
const { shuffle } = require("../misc");
const { get_rating } = require("./elo");

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

function get_num_players(roomname) {

  let rooms = get_rooms();
  let room = rooms[roomname];
  
  return Object.values(room.players).length;

}

function get_num_players_alive(roomname) {

  let rooms = get_rooms();
  let room = rooms[roomname];
  
  return Object.values(room.players).filter(p => !p.hit).length;

}

// create and add a new room to 'rooms' object
function createRoom(roomname) {

  let rooms = get_rooms();

  const newroom = {
    meta: {
      state: 'waiting',
      last_update_time: Date.now(),
      spawns: shuffle([spawn1, spawn2, spawn3, spawn4, spawn5, spawn6]),
    },
    spectators: {},
    players: {},
    bullets: [],
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

  send_room_state_to_spectator(ws);

  console.log('\nAdded spectator! here\'s rooms:\n');
  console.log(rooms);
}

function remove_spectator(ws) {
  let rooms = get_rooms();
  delete rooms[ws.room].spectators[ws.id];
}

// add/remove player logic
async function add_player(ws, roomname) {
  
  let players = get_players();
  let rooms = get_rooms();
  let room = rooms[roomname];

  // create room if it doesn't exist yet
  if (!rooms.hasOwnProperty(ws.room)) createRoom(ws.room);

  // check if max number of players reached

  if (room.meta.state == 'pre-match' || room.meta.state == 'waiting') {

    if (get_num_players(roomname) <= max_players) {

      room.meta.state = 'waiting';

      // new socket params
      ws.room = roomname;
      ws.type = 'player';
      ws.hit = false;
      ws.shots = 0;
      ws.last_shot_time = 0;
      ws.heading = 0;
      ws.aim = 0;
      ws.rating = await get_rating(ws);

      // move player to spawn point
      // console.log(room.meta);

      // console.log('\nB4: Source of truth:', spawn_points);
      // console.log('B4: Room spawn list:', room.meta.spawns);

      let spawn_point = room.meta.spawns.shift(); // removes current spawn location from list
      // console.log('Here\'s spawn point:', spawn_point);

      // console.log('\nAF: Source of truth:', spawn_points);
      // console.log('AF: Room spawn list:', room.meta.spawns);

      ws.spawn = spawn_point;
      ws.x = spawn_point[0];
      ws.y = spawn_point[1];

      room.meta.spawns = shuffle(room.meta.spawns);

      // add player to room
      room.players[ws.id] = ws;

      // add player to online players list
      players.push(ws.name);

    }
    else send_room_full(ws);
  }
  else {
    send_match_in_progress(ws);
  }
  
}

function remove_player(ws) {
  let rooms = get_rooms();
  let room = rooms[ws.room];
  let players = get_players();

  // remove player from room and list
  delete room.players[ws.id];
  set_players(players.filter(name => name != ws.name));

  // console.log('\n BEFORE:', room.meta.spawns);

  // push spawn point back to spawns list
  room.meta.spawns.push(ws.spawn);

  // console.log('\n AFTER:', room.meta.spawns);
}

module.exports = {
  get_rooms_list,
  createRoom, 
  remove_empty_rooms, 
  add_spectator, 
  remove_spectator, 
  add_player, 
  remove_player,
  get_num_players,
  get_num_players_alive,
};
