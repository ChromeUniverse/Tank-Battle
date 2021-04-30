// WebSockets library
const WebSocket = require('ws');
const colors = require('colors');

// Creating new WS server
let portNumber = 2848;
const wss = new WebSocket.Server({ port : portNumber });
console.log("\n[ START ]".green,`[ Websockets server started on port ${portNumber}]\n`);

// containers
let sockets = {};       // websockets
let rooms = {};         // rooms, room state and player data
let bullets = {};       // rooms and bullets
let obstacles = {};     // rooms and obstacles

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
function collide_PXP(p1, p2) {

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

function collide_PXO(p, o) {
  // clamping player X coord to obstacle borders
  let pointX = p.x;
  pointX = Math.min( pointX, o.right() );
  pointX = Math.max( pointX, o.left() );

  // clamping player Y coord to obstacle borders
  let pointY = p.y;
  pointY = Math.min( pointY, o.bottom() );
  pointY = Math.max( pointY, o.top() );

  // vector from nearest point to player
  // let dist = new p5.Vector(thing.x - pointX, thing.y - pointY);
  // let dist_mag = dist.mag();

  let deltaX = p.x - pointX;
  let deltaY = p.y - pointY;

  let dist = Math.hypot(deltaX, deltaY);

  if (dist < hit_radius) {
    // let normal = dist.normalize().mult(hit_radius-dist_mag);

    let normalX = deltaX / dist * (hit_radius-dist);
    let normalY = deltaY / dist * (hit_radius-dist);

    return [normalX, normalY];
  } else {
    return false;
  }
}

function collide_BXB(b1, b2) {
  // calculate distance between bullets 
  let dist = Math.hypot(b1.x-b2.x, b1.y-b2.y);

  if (dist < bullet_diam) {
    return true; 
  } else {
    return false;
  }  
}

function collide_PXB(p, b) {
  // calculate distance between player and bullet 
  let dist = Math.hypot(p.x-b.x, p.y-b.y);

  if (dist < hit_radius+bullet_diam/2) {    
    return true; 
  } else {
    return false;
  }  
    
}

function collide_BXO(b, o) {
  // obstacle X bullet collision
  
  // get point at box nearest to bullet

  // clamping bullet X coord to obstacle borders
  let pointX = b.x;
  pointX = Math.min( pointX, o.right() );
  pointX = Math.max( pointX, o.left() );

  // clamping player Y coord to obstacle borders
  let pointY = b.y;
  pointY = Math.min( pointY, o.bottom() );
  pointY = Math.max( pointY, o.top() );

  // vector from nearest point to bullet 
  // let dist = new p5.Vector(b.x - pointX, b.y - pointY);
  // let dist_mag = dist.mag();

  let deltaX = b.x - pointX;
  let deltaY = b.y - pointY;

  let dist = Math.hypot(deltaX, deltaY);

  if (dist < bullet_diam/2) {

    // get normal vector
    // let normal = dist.normalize().mult(bullet_diam/2-dist_mag);

    let normalX = deltaX / dist * (bullet_diam/2-dist);
    let normalY = deltaY / dist * (bullet_diam/2-dist);

    // vertical collision
    if (normalX == 0) {
      b.aim = 2*Math.PI - b.aim;        
      b.bounces += 1; 
    }

    // horizontal collision
    else if (normalY == 0) {
      b.aim = Math.PI - b.aim;        
      b.bounces += 1; 
    }

    else {
      let normalAngle = Math.atan(normalY/normalX);
      // console.log('normalangle is:',normalAngle);

      let velocityAngle = b['aim'];
      // console.log('velangle is:',velocityAngle);

      let newAngle = 2 * normalAngle - velocityAngle;
      // console.log('new angle is:',newAngle);

      // reflect velocity vector and bounce
      // b.vel = b.vel.reflect(normal);
      b['aim'] = newAngle;
      b.bounces += 1;

    }

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

  /*
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

      
      // noStroke();
      // fill('#ff0000');
      // ellipse(pointX, pointY, 5, 5);
      

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
  */

}



// creating obstacles
obstacles['testroom'] = [];
let box = new Obstacle(200, 200, 100, 100, '#7a7a7a');
obstacles['testroom'].push(box);
box = new Obstacle(200, 300, 100, 100, '#7a7a7a');
obstacles['testroom'].push(box);
box = new Obstacle(200, 400, 100, 100, '#7a7a7a');
obstacles['testroom'].push(box);
box = new Obstacle(300, 400, 100, 100, '#7a7a7a');
obstacles['testroom'].push(box);
box = new Obstacle(400, 400, 100, 100, '#7a7a7a');
obstacles['testroom'].push(box);
box = new Obstacle(500, 400, 100, 100, '#7a7a7a');
obstacles['testroom'].push(box);

box = new Obstacle(500, 50, 100, 100, '#7a7a7a');
obstacles['testroom'].push(box);

box = new Obstacle(800, 400, 100, 100, '#7a7a7a');
obstacles['testroom'].push(box);
box = new Obstacle(800, 300, 100, 100, '#7a7a7a');
obstacles['testroom'].push(box);
box = new Obstacle(800, 200, 200, 100, '#7a7a7a');
obstacles['testroom'].push(box);
box = new Obstacle(900, 150, 100, 50, '#7a7a7a');
obstacles['testroom'].push(box);


















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
      
      // trigerred on every new login message
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
          hit: false,
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

        // creating new bullet container/array if it doesn't already exist
        if (!bullets.hasOwnProperty(roomName)){
          console.log('[ NEW BULLET LIST ]'.cyan, '[ In room:', roomName.cyan, ']\n');
          bullets[roomName] = {};          
        } 

        let bullet_list = bullets[roomName];
        bullet_list[newPlayerID] = [];
        
        
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
      
      // triggered on every new 'move' message
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


          if (!p['hit']) {

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
            
            
            // checking for obstacle collision
    
            obstacles[roomName].forEach(box => {
              // let result = box.colliding(user);
              let result = collide_PXO(p, box);
              if (result != false){
                x += result[0];
                y += result[1];
              }
            });            


            // checking for player collision
            Object.values(room).forEach(p2 => {
              if (p2['id'] != p['id']) {
                // check for coliison between p and p2
                let result = collide_PXP(p, p2);
                if (result != false && !p2.hit){
                  // adjust p's coords
                  x += result[0];
                  y += result[1];
                }
              }
            });

          }          

          // update position
          p['x'] = x;
          p['y'] = y;
          p['angle'] = angle;
                  
        }
             
      }     
      
      // trigeered on every new 'shoot' message
      if (dataType == 'shoot') {
        // console.log('somebody shot');

        // find who sent the 'move' update        
        let ID = dataJson['id'];    
        let roomName = dataJson['room'];
        // get room's player list
        let room = rooms[roomName];
        // get room's bullet list
        let bullet_list = bullets[roomName];

        let aim = dataJson['aim'];

        // find player who shot the bullet
        let p = room[ID];

        if (!p['hit']) {
          // let initial_pos = p5.Vector.fromAngle(vel.heading(), hit_radius + bullet_diam/2);
          bulletX = p['x'] + (hit_radius + bullet_diam/2) * Math.sin(aim + Math.PI/2);
          bulletY = p['y'] - (hit_radius + bullet_diam/2) * Math.cos(aim + Math.PI/2);
          // console.log('\nNew bullet position:' + bulletX + ' ' + bulletY + '\n');
          
          // adding new bullet to room

          let newBullet = {          
            id: ID.toString(),
            name: dataJson['name'].toString(),
            color: dataJson['color'].toString(),
            x: bulletX,
            y: bulletY,  
            time: Date.now(),
            aim: aim,
            bounces: 0,
          };
          // console.log(newBullet);

          bullet_list[ID].push(newBullet);
          // console.log(bullets);
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


function send_player_hit(hit_id, roomName){

  let room = rooms[roomName];

  // send notification to all players in room
  Object.keys(room).forEach(id => {

    let name = room[id]['name'];

    let message = JSON.stringify(
      {
        type: 'player-hit',
        id: hit_id,
        name: name,
        room: roomName
      }
    )

    // need to check if connection is still open
    if (sockets.hasOwnProperty(id)){
      let client = sockets[id];        
      if (client.readyState === WebSocket.OPEN) {
        // sending JSON        
        client.send(message);
      }
    }
    
  });

}

function send_bullet_explode(b, roomName){

  let room = rooms[roomName];

  // send notification to all players in room
  Object.keys(room).forEach(id => {

    let message = JSON.stringify(
      {
        type: 'bullet-explode',
        x: b['x'],
        y: b['y'],
        room: roomName
      }
    )

    // need to check if connection is still open
    if (sockets.hasOwnProperty(id)){
      let client = sockets[id];        
      if (client.readyState === WebSocket.OPEN) {
        // sending JSON        
        client.send(message);
      }
    }
    
  });

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
      hit: p['hit'],
      x: p['x'],  
      y: p['y'],
      angle: p['angle']
    }
    room_to_send[p['id']] = player_to_send;
  });

  return room_to_send;
}



function run_physics(roomName){

  let room_bullets = bullets[roomName];
  let players = rooms[roomName];
  let box_list = obstacles[roomName];

  Object.keys(room_bullets).forEach(id => {

    let list = room_bullets[id];
    let new_list = [];

    list.forEach(b => {

      let add = true;

      // updating position based on velocity vector angle    
      b.x = b['x'] + (bullet_speed) * Math.sin(b['aim'] + Math.PI/2);
      b.y = b['y'] - (bullet_speed) * Math.cos(b['aim'] + Math.PI/2);

      // reflecting velocity vector angle on bounce

      // bouncing on walls:

      // top and bottom edges
      if (b.y <= bullet_diam/2 || b.y >= canvasH-bullet_diam/2) {      
        b.aim = 2*Math.PI - b.aim;        
        b.bounces += 1;                
      }
      // left and right edges
      if (b.x <= bullet_diam/2 || b.x >= canvasW-bullet_diam/2) {
        b.aim = Math.PI - b.aim; 
        b.bounces += 1;          
      }            

      // bouncing on obstacles:

      box_list.forEach(box => {          
        collide_BXO(b, box);
      });


      // removing bullets

      if (b.bounces == maxBounces) {
        add = false;
        send_bullet_explode(b, roomName);
      }

      // bullet X bullet collision
      list.forEach(b2 => {
        if (collide_BXB(b, b2)){
          // don't compare bullet with itself        
          if (b['x'] != b2['x'] && b['y'] != b2['y']) {       
            add = false;
            send_bullet_explode(b, roomName);
          }
        }  
      });

      // player X bullet collision
      Object.values(players).forEach(p => {
        if (collide_PXB(p, b) && !p['hit']){
        // if (collide_PXB(p, b)){
          console.log(p.name + 'got hit!');
          p.hit = true;
          add = false;
          send_player_hit(p['id'], roomName);
        }  
      });        

      if (add) {new_list.push(b);}
      
    });    
    room_bullets[id] = new_list;
  });

  return room_bullets;
}



function getBullets(roomName) {
  let room_bullets = bullets[roomName];
  
  // update bullet positions, calculate collisions, etc.
  room_bullets = run_physics(roomName);

  // creating player list to send to clients
  let bullets_to_send = {};

  Object.keys(room_bullets).forEach(id => {

    let list = room_bullets[id];
    let list_to_send = [];

    list.forEach(b => {
      let b_to_send = {
        id: b['id'],   
        name: b['name'],
        color: b['color'],
        x: b['x'],  
        y: b['y']
      }

      list_to_send.push(b_to_send); 
    });

    
    bullets_to_send[id] = list_to_send;
  });

  return bullets_to_send;
}

// send room state to all clients every [interval] milliseconds
var update_rate = 100;

var interval1 = 1000/update_rate;
setInterval(() => {

  // iterating through rooms
  Object.keys(rooms).forEach(roomName => {

    let room = rooms[roomName];    

    // get room state
    let players = getRoom(roomName);
    let bullets = getBullets(roomName);

    // send room state to all players in room
    Object.keys(room).forEach(id => {           

      // room state to send
      let room_state = {
        'players': players,
        'bullets': bullets
      };

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

  // getting client's room state
  let players = getRoom(roomName);
  let bullets = getBullets(roomName);

  // room state to send
  let room_state = {
    'players': players,
    'bullets': bullets
  };

  // get client's websocket and send room state
  let client = sockets[id];
  client.send(
    JSON.stringify(
      {
        type: 'set-room',
        'room-state': room_state
      }
    )
  );
}
