// package imports
const WebSocket = require('ws');
const colors = require('colors');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config();

// custom module imports
const { get_players, get_rooms } = require('./ws_modules/ws_utils');
const { add_input_to_queue, processInputs } = require('./ws_modules/inputs');
const { get_rooms_list, remove_empty_rooms, add_spectator, remove_spectator, add_player, remove_player } = require('./ws_modules/rooms');
const { send_game_state_to_clients } = require('./ws_modules/send_game_state');
const { generateID } = require('./misc');
const { auth } = require('./auth');
const { run_physics } = require('./ws_modules/physics');
const { time_step } = require('./ws_modules/constants');

/*

rooms = {
  '123456': {                 // roomname
    spectators: {
      'id1': websocket,
      'id2': websocket,
      'id3': websocket,
      'id4': websocket,
      'id5': websocket,
      'id6': websocket,
      'id7': websocket,
    },

    players: {
      'id2': websocket,
      'id1': websocket,
      'id3': websocket,
    },

    bullets: [ bulletObject, bulletObject, bulletObjects ],

    meta: room_metadataObject,

    map: [ obstacleObject, obstacleObject, obstacleObject ]

  },

  '234567': {},
  '345678': {},
}
*/

/*

Custom ws props

ws.name
ws.userID
ws.id
ws.x
ws.y
ws.heading
ws.aim

*/

// NOTE:
// Spectators -> receive 'stream' of game/room state updates
// Players    -> specatators that are also able to send inputs to the server



// Creating new WS server
let portNumber = 2000;
const wss = new WebSocket.Server({ port: portNumber });

// Starting up server
wss.on("listening", ws => {
  console.log("\n[ START ]".green, `[ Websockets server started on port ${portNumber}]\n`);
});

// Main Websockets Logic
wss.on("connection", async (ws, request) => {

  // authenticate incoming websocket connection
  // auth(request);

  const token = request.headers.cookie.split('=')[1];
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    console.log(err)
    ws.send(JSON.stringify({ error: true, message: 'Forbidden! Invalid credentials.' }));
    return ws.close();
  }

  ws.send(JSON.stringify({ error: false, message: 'Success!' }));

  console.log('\nDECODED:', decoded, '\n');

  ws.name = decoded.username;
  ws.userID = decoded.userID;
  ws.id = generateID();
  ws.color = decoded.tankColor;

  ws.on("message", async (data) => {

    try {

      // parse out data
      let dataJson = JSON.parse(data);
      let dataType = dataJson["type"];

      // add ws as spectator
      if (dataType == "spectate" && !ws.hasOwnProperty('type')) {
        
        ws.room = dataJson.room;
        ws.type = 'spectator';
        add_spectator(ws);
      }

      // add ws as player
      else if (dataType == "play" && ws.type == 'spectator' && !get_players().includes(ws.name)) {
        ws.room = dataJson.room;
        ws.type = 'player';
        ws.hit = false;
        ws.shots = 0;
        ws.last_shot_time = 0;
        add_player(ws);
        console.log('Adding player....')
      }

      else if (dataType == "play" && ws.type == 'spectator' && get_players().includes(ws.name)) {
        console.log('\n', ws.name.red, 'attempted to play in two rooms at once!', '\n', get_players(), '\n');
      }

      // handle player input
      else if (dataType == "input" && ws.type == 'player') { 
        add_input_to_queue(ws, dataJson) 
        // console.log('Got input!');
      }

      // rooms list request
      else if (dataType == "get-rooms") { get_rooms_list(ws); }

      else if (dataType == "get-name") { ws.send( JSON.stringify( { type: 'set-name', name: ws.name } ))}

      // invalid data type -> force close
      else {
        // console.log('No condition satisfied!', 'Type:', ws.type);
        // console.log(get_rooms());
      }
    }
    catch (err) {
      console.log('SERVER ERROR!')
      console.error(err);
      ws.close();
    }

  })

  ws.on("close", async () => {

    console.log('closed!');

    // remove player
    if (ws.type == 'player') {
      console.log('player left room', ws.room);
      console.log(get_rooms());
      remove_spectator(ws);
      remove_player(ws);
    }

    // remove spectator
    if (ws.type == 'spectator') {
      console.log('spectator left room', ws.room);      
      remove_spectator(ws);
      console.log(get_rooms());
    }

    // remove empty rooms
    remove_empty_rooms();

  });

});

setInterval(() => {
  processInputs();
  run_physics();
  send_game_state_to_clients();
}, time_step);