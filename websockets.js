// WebSockets library
const WebSocket = require('ws');
const colors = require('colors');

// Creating new WS server
let portNumber = 2848;
const wss = new WebSocket.Server({ port : portNumber });
console.log("\n[ START ]".green,`[ Websockets server started on port ${portNumber}]\n`);


// stores all active rooms
let rooms = {}; 

// connection pool
let sockets = {}

// tank dimensions
const tankW = 40;
const tankH = 40;

// player speed
const speedX = 5;
const speedY = 5;

// canvas properties
const canvasW = 1200; 
const canvasH = 600;

// tank dimensions
const tankW = 60;
const tankH = 40;

// player hit-circle
const hit_radius = 30;

// player speed
const player_speed = 3;
const rotation_speed = 3;

// bullet parameters
const bullet_speed = 7;
const bullet_interval = 350;
const bullet_diam = 15;
const reload_interval = 2000;
const maxBounces = 4;
const max_shots = 5;

// animation parameters
const explosion_radius = 100; 
const explosion_duration = 200;
const bullet_explosion_radius = 30; 
const bullet_explosion_duration = 200;


/*

**************** Player Class ****************

*/

class Player{
  // creates new player instance
  constructor(id, name, col, x, y, vel){
    // identification
    this.id = id;
    this.name = name;
    this.col = col; // color

    // position
    this.x = x;
    this.y = y;

    // vectors
    this.vel = vel;   // velocity
    this.aim = vel;   // turret aim

    this.hit = false; // player got hit

    this.bullets = [];
    this.reloading = false;
    this.cooldown = false;
  }

  // check for collision with other players
  colliding(thing) {

    if (thing instanceof Player) {

      // vector between both players
      let dist = createVector(thing.x-this.x, thing.y-this.y);
      let dist_mag = dist.mag();

      if (dist_mag < hit_radius*2) {
        let normal = dist.normalize().mult(hit_radius*2-dist_mag);
        return [normal.x, normal.y];
      } else {
        return false;
      }
      

    }

  } 
  
}







// genreate unique ID for players
function getUniqueID() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  }                                  
  return s4() + s4() + s4();
}


// Websockets stuff
wss.on("connection",
	ws => {	
    // generate new uniqueID
    let newID = getUniqueID();
    
    // send ID to newly logged in user
    ws.send(
      JSON.stringify(
        {
          type: "set-id",
          id: newID
        }
      )
    );
    
    // store websocket in sockets list
    sockets[newID] = ws;

    console.log("[ NEW ID ]".cyan, "[ Send out ID#" + newID.cyan + " to new client ]\n");

		// Incoming data
		ws.on("message", data => {
      // parse out data
      let dataJson = JSON.parse(data);
      let dataType = dataJson["type"];
      
      // trigerred on every new login event
      if (dataType == "login") {
        
        // get new player data
        let newPlayerID = dataJson['id']
        let newPlayerName = dataJson['name'];
        let newPlayerColor = dataJson['color'];
        let newPlayerX = dataJson['x'];
        let newPlayerY = dataJson['y'];
        // let roomName = dataJson['room'];        
        let roomName = 'testroom';

        // add new player to player list
        let newPlayerEntry = {
          id: newPlayerID.toString(),
          name: newPlayerName.toString(),
          color: newPlayerColor.toString(),
          x: newPlayerX,
          y: newPlayerY,
          room: roomName,          
        }

        // log new player
        console.log("[ NEW USER ]".cyan, "[", [newPlayerID, newPlayerName, newPlayerColor, newPlayerX, newPlayerY, roomName], ']\n');


        // creating new room if it doesn't already exist
        if (!rooms.hasOwnProperty(roomName)){
          console.log('[ NEW ROOM ]'.cyan, '[ Creating room:', roomName.cyan, ']\n');
          rooms[roomName] = {};          
        } 
        
        let room = rooms[roomName];
        room[newPlayerID] = newPlayerEntry;
        
        console.log("[ ONLINE PLAYER LIST ]".magenta, "\n", rooms, '\n');

        Object.keys(room).forEach(id => {
          let client = sockets[id];
          if (client.readyState === WebSocket.OPEN) {
            // building JSON
            let message = JSON.stringify(
              {
                type: 'new-player',
                id: newPlayerID.toString(),
                name: newPlayerName.toString(),
                color: newPlayerColor.toString(),
                x: newPlayerX,
                y: newPlayerY,  
              }
            )
            // send JSON
            client.send(message);
          }
        });        

        // send ID to newly logged in user
        send_set_room(newPlayerID, roomName);        
      }  
      
      // triggered on every new 'move' event
      if (dataType == "move") {                    
        // find who sent the 'move' update        
        let ID = dataJson['id'];    
        let roomName = dataJson['room'];
        let room = rooms[roomName];

        let keystrokes = dataJson['keys'];

        if (room.hasOwnProperty(ID)) {
          let p = room[ID];
          let x = p['x'];
          let y = p['y'];

          // check keystrokes
          if (keystrokes.includes('w')) {            
            y -= speedY; 
            if (y < tankH/2) { y = tankH/2; }
          }
          if (keystrokes.includes('a')) {
            x -= speedX; 
            if (x < tankW/2) { x = tankW/2; }                        
          }
          if (keystrokes.includes('s')) {
            y += speedY; 
            if (y > canvasH-tankH/2) { y = canvasH-tankH/2; }
          }
          if (keystrokes.includes('d')) {
             x += speedX; 
             if (x > canvasW-tankW/2) { x = canvasW-tankW/2; }
          }

          // update position
          p['x'] = x;
          p['y'] = y;        
        }
             
      }      

		});

		// When the WS is closed
		ws.on("close", () => {
      // remove connection from sockets list
      // ...
      // update socket list
      let new_sockets = {};        
      Object.keys(sockets).forEach(id => {
        let socket = sockets[id];
        // removing timed out connections
        if (socket != ws) {
          new_sockets[id] = socket;
        } else {          
          remove_player(id);
        }
      });
      sockets = new_sockets;
		});
	}
);




// removes player from room
function remove_player(removedID){  
  
  let removed_player_room_name = '';
  let removed_player_name = '';

  // finding timed out player
  Object.keys(rooms).forEach(roomName => {
    let is_done = false;

    let room = rooms[roomName];
    let new_room = {};

    Object.keys(room).forEach(id => {
      let p = room[id];

      if (id == removedID) {
        console.log('[ REMOVE PLAYER ]'.red, '[', p['name'].red, p['id'].red, p['room'].red, ']\n');
        removed_player_name = p['name'];
        removed_player_room_name = p['room'];
        is_done = true;
      } else {
        // add active players
        new_room[id] = p;
      }

    });

    rooms[roomName] = new_room;
    
    if (is_done) {return true;}

  });


  // removing empty rooms
  
  new_rooms = {};
  
  Object.keys(rooms).forEach(roomName => {
    let is_done = false;
    let room = rooms[roomName];
    
    if (Object.keys(room) == 0) {
      console.log('[ EMPTY ROOM ]'.red, '[ Removing room', roomName.red, ']\n');
      is_done = true;
    } else {
      // add active rooms
      new_rooms[roomName] = room;
    }

    if (is_done) {return true;}
  });
  // update rooms
  rooms = new_rooms;

  // get removed player's room
  removed_player_room = rooms[removed_player_room_name];


  if (rooms.hasOwnProperty(removed_player_room_name)) {
    // alert everybody in the room
    Object.keys(removed_player_room).forEach(id => {

      let client = sockets[id];
      if (client.readyState === WebSocket.OPEN) {
        // send message
        let message = JSON.stringify(
          {
            type: 'delete-player',
            id: removedID,
            name: removed_player_name
          }
        );            
        client.send(message);            
      }    
      
    });
  }
  
}




// gets room name and returns corresponding room object
function getRoom(roomName) {

  let room = rooms[roomName];

  // creating player list to send to clients
  let room_to_send = {};

  Object.values(room).forEach(p => {
    let player_to_send = {
      id: p['id'],   
      name: p['name'],
      color: p['color'],
      x: p['x'],  
      y: p['y'],
    }
    room_to_send[p['id']] = player_to_send;
  });

  return room_to_send;
}


// send room state to all clients every [interval] milliseconds
var interval1 = 10;
setInterval(() => {

  // iterating through rooms
  Object.keys(rooms).forEach(roomName => {

    let room = rooms[roomName];    

    // send room state to all players in room
    Object.keys(room).forEach(id => {

      // get room state
      let room_state = getRoom(roomName);

      // need to check if connection is still open
      if (sockets.hasOwnProperty(id)){
        let client = sockets[id];        
        if (client.readyState === WebSocket.OPEN) {
          // sending JSON
          let message = JSON.stringify(
            {
              type: 'room-update',
              'room-state': room_state
            }
          );
          client.send(message);
        }
      }
      
    });

  });
  
}, interval1);


// sends initial room state for client-side room init
function send_set_room(id, roomName) {

  // getting client's room
  let room = getRoom(roomName);

  // get client's websocket and send room state
  let client = sockets[id];
  client.send(
    JSON.stringify(
      {
        type: 'set-room',
        'room-state': room
      }
    )
  );
}
