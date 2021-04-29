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


// canvas properties
const canvasW = 1200; 
const canvasH = 600;

const speedX = 5;
const speedY = 5;

// tank dimensions
const tankW = 40;
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
  constructor(id, name, col, x, y, vel_angle){
    // identification
    this.id = id;
    this.name = name;
    this.col = col; // color

    // position
    this.x = x;
    this.y = y;

    // vectors
    this.vel_angle = vel_angle;   // velocity
    this.aim_angle = vel_angle;   // turret aim

    this.hit = false; // player got hit

    this.bullets = [];
    this.reloading = false;
    this.cooldown = false;
  }

  // check for collision with other players
  colliding(thing) {

    if (thing instanceof Player) {

      // vector between both players
      // let dist = createVector(thing.x-this.x, thing.y-this.y);
      // let dist_mag = dist.mag();
      distX = thing.x-this.x;
      distY = thing.y-this.y;
      let dist_mag = Math.hypot(distX, distY);

      if (dist_mag < hit_radius*2) {
        // let normal = dist.normalize().mult(hit_radius*2-dist_mag);
        // return [normal.x, normal.y];

        // take X and Y components of the normal vector, normalize and multiply by overlap

        let normalX = distX / dist_mag * (hit_radius*2-dist_mag);
        let normalY = distY / dist_mag * (hit_radius*2-dist_mag);
        return [normalX, normalY];

      } else {
        return false;
      }
      

    }

  } 
  
}

// check for collision with other players
function collide_pXp(p1, p2) {

  // vector between both players
  // let dist = createVector(thing.x-this.x, thing.y-this.y);
  // let dist_mag = dist.mag();
  distX = p1.x-p2.x;
  distY = p1.y-p2.y;
  let dist_mag = Math.hypot(distX, distY);

  if (dist_mag < hit_radius*2) {
    // let normal = dist.normalize().mult(hit_radius*2-dist_mag);
    // return [normal.x, normal.y];

    // take X and Y components of the normal vector, normalize and multiply by overlap

    let normalX = distX / dist_mag * (hit_radius*2-dist_mag);
    let normalY = distY / dist_mag * (hit_radius*2-dist_mag);
    return [normalX, normalY];

  } else {
    return false;
  }

} 



/*

**************** Bullet Class ****************

*/

class Bullet {

  constructor(p, time, vel) {
    this.id = p.id;       // -> ID of player who shot bullet
    this.name = p.name;   // -> name of player who shot bullet
    this.col = p.col;

    let initial_pos = p5.Vector.fromAngle(vel.heading(), hit_radius + bullet_diam/2);

    this.x = p.x + initial_pos.x;
    this.y = p.y + initial_pos.y;
    // this.x = p.x;
    // this.y = p.y;
    this.time = time;   // -> time the bullet was shot
    this.vel = vel;     // -> velocity vector
    this.bounces = 0;    
    
  }

  // check for collisions

  colliding(thing){    

    // vector between bullet and thing
    let dist = createVector(thing.x-this.x, thing.y-this.y);
    let dist_mag = dist.mag();


    // bullet X player collision
    if (thing instanceof Player) {           

      if (dist_mag < hit_radius+bullet_diam/2) {
        return true; 
      } else {
        return false;
      }
    }
  

    // bullet X bullet collision
    if (thing instanceof Bullet) {      
      if (dist_mag < bullet_diam) {
        return true; 
      } else {
        return false;
      }
    } 


    // obstacle X bullet collision
    if (thing instanceof Obstacle ) {

      // get point at box nearest to bullet

      // clamping bullet X coord to obstacle borders
      let pointX = this.x;
      pointX = min( pointX, thing.right() );
      pointX = max( pointX, thing.left() );

      // clamping player Y coord to obstacle borders
      let pointY = this.y;
      pointY = min( pointY, thing.bottom() );
      pointY = max( pointY, thing.top() );

      /*
      noStroke();
      fill('#0000ff');
      ellipse(pointX, pointY, 5, 5);
      */

      // vector from nearest point to bullet 
      let dist = new p5.Vector(this.x - pointX, this.y - pointY);
      let dist_mag = dist.mag();

      if (dist_mag < bullet_diam/2) {

        // get normal vector
        let normal = dist.normalize().mult(bullet_diam/2-dist_mag);

        // reflect velocity vector and bounce
        this.vel = this.vel.reflect(normal);
        this.bounces += 1;

        return [normal.x, normal.y];

      } else {
        return false;
      }
    
    }
    
  }

}



/*

**************** Obstacle Class ****************

*/



class Obstacle {
  constructor(x, y, w, h, col) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.col = col;
  }

  // get edges
  top() {return this.y}
  left() {return this.x}
  bottom() {return this.y + this.h;}
  right() {return this.x + this.w;}

  colliding(thing) {
    // obstacle X player collision
    if (thing instanceof Player) {
      // get point at rectangle nearest to player

      // clamping player X coord to obstacle borders
      let pointX = thing.x;
      pointX = min( pointX, this.right() );
      pointX = max( pointX, this.left() );

      // clamping player Y coord to obstacle borders
      let pointY = thing.y;
      pointY = min( pointY, this.bottom() );
      pointY = max( pointY, this.top() );

      /*
      noStroke();
      fill('#ff0000');
      ellipse(pointX, pointY, 5, 5);
      */

      // vector from nearest point to player
      let dist = new p5.Vector(thing.x - pointX, thing.y - pointY);
      let dist_mag = dist.mag();

      if (dist_mag < hit_radius) {
        let normal = dist.normalize().mult(hit_radius-dist_mag);
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
        let newPlayerAngle = dataJson['angle'];
        // let roomName = dataJson['room'];        
        let roomName = 'testroom';

        // add new player to player list
        let newPlayerEntry = {
          id: newPlayerID.toString(),
          name: newPlayerName.toString(),
          color: newPlayerColor.toString(),
          x: newPlayerX,
          y: newPlayerY,
          angle: newPlayerAngle,
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
                angle: newPlayerAngle
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
          let angle = p['angle'];

          // check keystrokes
          if (keystrokes.includes('w')) {            
            x += player_speed * Math.sin(angle);
            y -= player_speed * Math.cos(angle);
          }
          if (keystrokes.includes('a')) {   
            angle -= rotation_speed * (Math.PI/180);                   
          }
          if (keystrokes.includes('s')) {
            x -= player_speed * Math.sin(angle);
            y += player_speed * Math.cos(angle);
          }
          if (keystrokes.includes('d')) {
            angle += rotation_speed * (Math.PI/180);
          }

          // clamping x and y to canvas borders
          x = Math.max(x, hit_radius);
          x = Math.min(x, canvasW-hit_radius);
          y = Math.max(y, hit_radius);
          y = Math.min(y, canvasH-hit_radius);                

          Object.values(room).forEach(p2 => {
            if (p2.id != p.id) {
              // let result = p.colliding(p2);
              let result = collide_pXp(p, p2);
              if (result != false && !p.hit){
                // console.log('Players ' + p.name + ' and ' + p2.name + 'collided!');
                x += result[0];
                y += result[1];
              }
            }
          });

          // update position
          p['x'] = x;
          p['y'] = y;
          p['angle'] = angle;
                  
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
      angle: p['angle']
    }
    room_to_send[p['id']] = player_to_send;
  });

  return room_to_send;
}


// send room state to all clients every [interval] milliseconds
var update_rate = 50

var interval1 = 1000/update_rate;
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
