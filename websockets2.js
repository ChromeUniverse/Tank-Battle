// module imports
const WebSocket = require('ws');
const colors = require('colors');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const atob = require('atob');
const validator = require('validator');
require('dotenv').config();

const { get_inputs, get_players, get_rooms } = require('./ws_modules/ws_utils');
const { add_input_to_queue, processInputs } = require('./ws_modules/inputs');
const { get_rooms_list, remove_empty_rooms, add_spectator, remove_spectator, add_player, remove_player } = require('./ws_modules/rooms');


function generateID() {
  return Math.floor((1 + Math.random()) * 0x10000000000000).toString(16).substring(1)
}


// Creating new WS server
let portNumber = 2000;
const wss = new WebSocket.Server({ port: portNumber });


// globals
let game_tick = 0;
const time_step = 50;    // time step in milliseconds
const tick_step = 10;    // game tick step in milliseconds
// let rooms = {};
// let inputs = [];
// let players = [];

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
  '456789': {},
  '567890': {},
}


*/

// NOTE:
// Spectators -> receive 'stream' of game/room state updates
// Players    -> specatators that are also able to send inputs to the server

// Starting up server
wss.on("listening", ws => {
  console.log("\n[ START ]".green, `[ Websockets server started on port ${portNumber}]\n`);
});

// Main Websockets Logic
wss.on("connection", async (ws, request) => {

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

      let players = get_players();
      let rooms = get_players();

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
      else if (dataType == "play" && ws.type == 'spectator' && !players.includes(ws.name)) {
        ws.room = dataJson.room;
        ws.type = 'player';
        add_player(ws);
      }

      else if (dataType == "play" && ws.type == 'spectator' && players.includes(ws.name)) {
        console.log('\n', ws.name.red, 'attempted to play in two rooms at once!', '\n');
      }

      // handle player input
      else if (dataType == "input" && ws.type == 'player') { 
        add_input_to_queue(ws, dataJson) 
        console.log('Got input!');
      }

      // rooms list request
      else if (dataType == "get-rooms") { get_rooms_list(ws); }

      // invalid data type -> force close
      else {
        console.log('No condition satisfied!', 'Type:', ws.type);
        console.log(get_rooms());
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

setInterval(() => {
  processInputs();
  send_game_state_to_clients();
}, time_step);

