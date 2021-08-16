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
let rooms_status = {};  // rooms metadata
let bullets = {};       // rooms and bullets
let obstacles = {};     // rooms and obstacles

// canvas properties
const canvasW = 1200; 
const canvasH = 600;

// player properties
const hit_radius = 30;
const player_speed = 3;
const rotation_speed = 3;

// bullet properties
const bullet_speed = 4;
const bullet_interval = 350;
const bullet_diam = 15;
const reload_interval = 2000;
const maxBounces = 3;
const max_shots = 5;

// game match properties
const max_players = 6;
// in SECONDS!
const pre_match_time = 6;     
const post_match_time = 6;    


// collision checking functions

// player x player collision
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

// player x obstacle collision
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

// bullet x bullet collision
function collide_BXB(b1, b2) {
  // calculate distance between bullets 
  let dist = Math.hypot(b1.x-b2.x, b1.y-b2.y);

  if (dist < bullet_diam) {
    return true; 
  } else {
    return false;
  }  
}

// player x bullet collision
function collide_PXB(p, b) {
  // calculate distance between player and bullet 
  let dist = Math.hypot(p.x-b.x, p.y-b.y);

  if (dist < hit_radius+bullet_diam/2) {    
    return true; 
  } else {
    return false;
  }  
    
}

// bullet x obstacle collision
function collide_BXO(b, o) {
  
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


// process 'shoot' events
function shoot(p, aim) {

  if (!p['hit']) {

    let roomName = p['room']

    let b_list = bullets[roomName][p['id']];
    let list = p['shots'];

    if (list.length > 0) {
      // only add new bullet after [bullet_interval] milliseconds have passed
      let last_time = list[list.length-1]['time'];

      // timeout after three shots to "reload"
      if (list.length == max_shots) {           
        
        p['reloading'] = true;

        // do nothing for [reload_timeout] milliseconds
        if (Date.now() - last_time > reload_interval) {

          // reset user's bullets
          p['shots'] = [];
          p['reloading'] = false;

        }        
        
      } else {

        if ( Date.now() - last_time > bullet_interval ) {
          p['reloading'] = false;
          p['cooldown'] = true;
          // let bullet = new Bullet(user, Date.now(), velScaled);  
          
          let bulletX = p['x'] + (hit_radius + bullet_diam/2) * Math.sin(aim + Math.PI/2);
          // let bulletX = p['x'] + (hit_radius + bullet_diam/2) * Math.cos(aim);
          let bulletY = p['y'] - (hit_radius + bullet_diam/2) * Math.cos(aim + Math.PI/2);
          // let bulletY = p['y'] + (hit_radius + bullet_diam/2) * Math.sin(aim);      
                
          let newBullet = {          
            id: p['id'].toString(),
            name: p['name'].toString(),
            color: p['color'].toString(),
            x: bulletX,
            y: bulletY,  
            time: Date.now(),
            aim: aim,
            bounces: 0,
          };
          // console.log(newBullet);

          list.push(newBullet);  
          b_list.push(newBullet);   
          send_bullet_explode(newBullet, roomName);
          send_aim(p, aim, roomName);        
          // console.log(bullets);
          
        }

      }

      // user.bullets[user.bullets.length()-1];

    } else {

      /*      
      user.reloading = false;
      user.cooldown = true;
      let bullet = new Bullet(user, Date.now(), velScaled);   
      bullets.push(bullet);
      user.bullets.push(bullet);
      */

      p['reloading'] = false;
      p['cooldown'] = true;
      // let bullet = new Bullet(user, Date.now(), velScaled);  
      
      let bulletX = p['x'] + (hit_radius + bullet_diam/2) * Math.sin(aim + Math.PI/2);
      let bulletY = p['y'] - (hit_radius + bullet_diam/2) * Math.cos(aim + Math.PI/2);          
            
      let newBullet = {          
        id: p['id'].toString(),
        name: p['name'].toString(),
        color: p['color'].toString(),
        x: bulletX,
        y: bulletY,  
        time: Date.now(),
        aim: aim,
        bounces: 0,
      };
      // console.log(newBullet);
      list.push(newBullet);
      b_list.push(newBullet);    
      send_bullet_explode(newBullet, roomName); 
      send_aim(p, aim, roomName);      
      // console.log(bullets);

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

}


function createObstables(room_name) {
  // creating obstacles
  obstacles[room_name] = [];
  let box = new Obstacle(200, 200, 100, 100, '#7a7a7a');
  obstacles[room_name].push(box);
  box = new Obstacle(200, 300, 100, 100, '#7a7a7a');
  obstacles[room_name].push(box);
  box = new Obstacle(200, 400, 100, 100, '#7a7a7a');
  obstacles[room_name].push(box);
  box = new Obstacle(300, 400, 100, 100, '#7a7a7a');
  obstacles[room_name].push(box);
  box = new Obstacle(400, 400, 100, 100, '#7a7a7a');
  obstacles[room_name].push(box);
  box = new Obstacle(500, 400, 100, 100, '#7a7a7a');
  obstacles[room_name].push(box);

  box = new Obstacle(500, 50, 100, 100, '#7a7a7a');
  obstacles[room_name].push(box);

  box = new Obstacle(800, 400, 100, 100, '#7a7a7a');
  obstacles[room_name].push(box);
  box = new Obstacle(800, 300, 100, 100, '#7a7a7a');
  obstacles[room_name].push(box);
  box = new Obstacle(800, 200, 200, 100, '#7a7a7a');
  obstacles[room_name].push(box);
  box = new Obstacle(900, 150, 100, 50, '#7a7a7a');
  obstacles[room_name].push(box);
}






// player spawn locations

let spawn_points = [ 
  [ 100, 100 ], 
  [ 250, 550 ], 
  [ 350, 350 ], 
  [ 700, 450 ],
  [ 1100, 500 ],
  [ 900, 100 ]  
];





// generate unique ID
function getUniqueID() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  }                                  
  return s4() + s4() + s4();
}


// Websockets stuff
wss.on("connection", ws => {	

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

        // let spawn_point = spawn_points[ Math.floor( Math.random() * spawn_points.length ) ];
        // let newPlayerX = spawn_point[0];
        // let newPlayerY = spawn_point[1];

        let newPlayerAngle = dataJson['angle'];
        let roomName = dataJson['room'];        
        // let roomName = 'testroom';

        // // add new player to player list
        // let newPlayerEntry = {
        //   id: newPlayerID.toString(),
        //   name: newPlayerName.toString(),
        //   color: newPlayerColor.toString(),
        //   hit: false,
        //   x: newPlayerX,
        //   y: newPlayerY,
        //   angle: newPlayerAngle,
        //   aim: 0,
        //   room: roomName,   
        //   shots: [],       
        //   reloading : false,
        //   cooldown : false
        // }



        // creating new rooms status entry if it doesn't already exist
        if (!rooms_status.hasOwnProperty(roomName)){
          
          // room status entry doesn't exist
          console.log('[ NEW ROOM STATUS ENTRY ]'.cyan, '[ In room:', roomName.cyan, ']\n');

          rooms_status[roomName] = {
            create_time: Date.now(),            
            last_login_time: Date.now(),
            num_players: 1,
            match_running: false,
            match_start_time: -1,
            match_over: false,
            match_finish_time: -1,
          };          

          // creating new room
          console.log('[ NEW ROOM ]'.cyan, '[ Creating room:', roomName.cyan, ']\n');      
          
          // get spawn position
          let spawn_point = spawn_points[0];
          let newPlayerX = spawn_point[0];
          let newPlayerY = spawn_point[1];

          // add new player to player list
          let newPlayerEntry = {
            id: newPlayerID.toString(),
            name: newPlayerName.toString(),
            color: newPlayerColor.toString(),
            hit: false,
            spawn: spawn_point,
            x: newPlayerX,
            y: newPlayerY,
            angle: newPlayerAngle,
            aim: 0,
            room: roomName,   
            shots: [],       
            reloading : false,
            cooldown : false
          }


          rooms[roomName] = {}
          let room = rooms[roomName];
          room[newPlayerID] = newPlayerEntry;   

          createObstables(roomName);

          // log new player
          console.log("[ NEW USER ]".cyan, "[", [newPlayerID, newPlayerName, newPlayerColor, newPlayerX, newPlayerY, roomName], ']\n');


          // creating new bullet list entry for room
          console.log('[ NEW BULLET LIST ]'.cyan, '[ In room:', roomName.cyan, ']\n');
          bullets[roomName] = {};          
          let bullet_list = bullets[roomName];
          bullet_list[newPlayerID] = [];

          console.log("[ ROOMS STATUS ]".magenta, "\n", rooms_status, '\n');

        } else {
          // room status entry already exists

          let status = rooms_status[roomName];

          // check to see if room is full
          if (status['num_players'] < max_players) {

            // only let player join the room during pre-match

            if (!status['match_running'] && !status['match_over']) {

              status['num_players'] += 1;
              status['last_login_time'] = Date.now();

              console.log("[ PLAYERS LIST ]".magenta, "\n", rooms, '\n');
              console.log("[ BULLETS LIST ]".magenta, "\n", bullets, '\n');
              console.log("[ ROOMS STATUS ]".magenta, "\n", rooms_status, '\n');

              // update rooms

              let spawn_point = spawn_points[status['num_players']-1];
              let newPlayerX = spawn_point[0];
              let newPlayerY = spawn_point[1];

              // add new player to player list
              let newPlayerEntry = {
                id: newPlayerID.toString(),
                name: newPlayerName.toString(),
                color: newPlayerColor.toString(),
                hit: false,
                spawn: spawn_point,
                x: newPlayerX,
                y: newPlayerY,
                angle: newPlayerAngle,
                aim: 0,
                room: roomName,   
                shots: [],       
                reloading : false,
                cooldown : false
              }
            

              let room = rooms[roomName];
              room[newPlayerID] = newPlayerEntry;

              // log new player
              console.log("[ NEW USER ]".cyan, "[", [newPlayerID, newPlayerName, newPlayerColor, newPlayerX, newPlayerY, roomName], ']\n');


              // update bullets
              let bullet_list = bullets[roomName];
              bullet_list[newPlayerID] = [];


              // sending data to all clients in room

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
                      angle: newPlayerAngle,
                      shots: 0,
                    }
                  )
                  // send JSON
                  client.send(message);
                }
              });        

              // send ID to newly logged in user
              send_set_room(newPlayerID, roomName); 

            }

            

          } else {
            // room is full!
            console.log('[ ROOM FULL ]'.red, '[ Client attempted to enter full room ]', '\n');
          }

        }  
        
               
      }     

      // get rooms
      if (dataType == "get-rooms") {

        console.log('Got rooms list request');

        // create list of room objects to send
        let rooms_list = Object.keys(rooms_status).map(room_name => {
          return { name: room_name }
        });

        // send list of rooms to client
        ws.send(
          JSON.stringify(
            {
              type: "rooms-list",
              rooms_list: rooms_list
            }
          )
        );

      }

      let roomName = dataJson['room'];

      // check if room is registered in status list

      if (rooms_status.hasOwnProperty(roomName)){

        let status = rooms_status[roomName];

        // check if room is full

        if (status['num_players'] <= max_players) {

          // only process move and shoot events when the match is running

          if (status['match_running']) {

            // find who sent the update        
            let ID = dataJson['id'];    
            let roomName = dataJson['room'];
            let room = rooms[roomName];
            let p = room[ID];
          
            // triggered on every new 'move' message
            if (dataType == "move") {                    
              
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

                    if (keystrokes.includes('a')) {   
                      angle -= rotation_speed * (Math.PI/180);                   
                    }

                    if (keystrokes.includes('d')) {
                      angle += rotation_speed * (Math.PI/180);
                    }

                  }
                  
                  if (keystrokes.includes('s')) {
                    x -= player_speed * Math.sin(angle);
                    y += player_speed * Math.cos(angle);


                    if (keystrokes.includes('a')) {   
                      angle += rotation_speed * (Math.PI/180);                   
                    }

                    if (keystrokes.includes('d')) {
                      angle -= rotation_speed * (Math.PI/180);
                    }
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
            
            // triggered on every new 'shoot' message

            if (dataType == 'shoot') {

              // find who sent the 'move' update        
              let ID = dataJson['id'];    
              let roomName = dataJson['room'];
              // get room's player list
              let room = rooms[roomName];                
              // find player who shot the bullet
              let p = room[ID];

              let aim = dataJson['aim'];        

              if (!p['hit']) {
                p['aim'] = aim;
                shoot(p, aim);
              }          
              
            }
          }

          

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


// reset room for new match

function reset(roomName) {

  let room = rooms[roomName];
  let b_room = bullets[roomName];

  // reset player attributes
  Object.keys(room).forEach(id => {

    let p = room[id];
    
    // reset bullets
    b_room[id] = [];

    // revive all players
    p['hit'] = false;

    // pull players back to their original spawn locations
    let spawn = p['spawn'];
    p['x'] = spawn[0];
    p['y'] = spawn[1];
    p['angle'] = 0;
    
    // reset weapon variables 
    p['aim'] = 0;
    p['shots'] = [];          
    p['reloading'] = false;
    p['cooldown'] = false;

  });

  console.log(bullets[roomName]);

}






// sending match updates to clients

function send_pre_match(roomName){
  let room = rooms[roomName];

  // send notification to all players in room
  Object.keys(room).forEach(id => {

    let message = JSON.stringify(
      {
        type: 'match-update',
        'match-state': 'pre-match'
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

function send_match_start(roomName){
  let room = rooms[roomName];

  // send notification to all players in room
  Object.keys(room).forEach(id => {

    let message = JSON.stringify(
      {
        type: 'match-update',
        'match-state': 'match-start'
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

function send_post_match(roomName, winner){
  let room = rooms[roomName];

  let winner_id = winner['id'];
  let winner_name = winner['name'];

  // send notification to all players in room
  Object.keys(room).forEach(id => {

    let message = JSON.stringify(
      {
        type: 'match-update',
        'match-state': 'post-match',
        'id': winner_id,
        name: winner_name
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






// get list of not dead players 
function get_alive(roomName){
  let alive = [];

  let room = rooms[roomName];

  // looping over players in room
  Object.values(room).forEach(p => {
    // player is still alive
    if (!p['hit']) {alive.push(p);}
  });

  return alive;
}


function update_room_status(roomName) {

  /*
  rooms_status[roomName] = {
    create_time: Date.now(),            
    last_login_time: Date.now(),
    num_players: 1,
    match_running: false,
    match_start_time: -1,
    match_over: false,
    match_finish_time: -1,
  };   
  */

  let room = rooms[roomName];

  let status = rooms_status[roomName];

  let alive = get_alive(roomName);

  let time_now = Date.now();

  if (status['match_running']) {
    // match

    let num_alive = alive.length;

    if (num_alive == 1) {

      // we have a winner 🎉 -> move to post-match
      status['match_running'] = false;
      status['match_over'] = true;
      status['match_finish_time'] = Date.now();

      let winner = alive[0];

      console.log('[ MATCH OVER ]'.green, '[ In room:' , roomName.cyan, 'Winner:', winner['name'].green ,'! ]\n');

      send_post_match(roomName, winner);
    }

  } else {

    if (!status['match_over']) {
      // pre-match      

      if (time_now - Math.max(status['last_login_time'], status['match_finish_time'] + post_match_time*1000) > pre_match_time*1000) {
        // time to start the match
        status['match_running'] = true;
        status['match_start_time'] = Date.now();
        console.log('[ MATCH START ]'.green, ' [ In room:' , roomName.cyan, ']\n');
        send_match_start(roomName);
      }

    } else {
      // post-match

      if (time_now - status['match_finish_time'] > post_match_time*1000) {
        // time to move to pre-match

        status['match_over'] = false; 
        console.log('Pre-match!\n');       

        // reset 'hit' players
        reset(roomName);        

        send_pre_match(roomName);

      }

    }

  }

}







// removes player from room
function remove_player(removedID){  
  
  let removed_player_room_name = '';
  let removed_player_name = '';

  // finding timed out player
  Object.keys(rooms).forEach(roomName => {
    let is_done = false;

    let room = rooms[roomName];
    let bullet_room = bullets[roomName];    
    let status = rooms_status[roomName];

    let new_room = {};
    let new_bullet_room = {};    


    Object.keys(room).forEach(id => {
      let p = room[id];
      let b_list = bullet_room[id];

      if (id == removedID) {
        console.log('[ REMOVE PLAYER ]'.red, '[', p['name'].red, p['id'].red, p['room'].red, ']\n');
        removed_player_name = p['name'];
        removed_player_room_name = p['room'];

        status['num_players'] -= 1;

        is_done = true;
      } else {
        // add active players
        new_room[id] = p;
        new_bullet_room[id] = b_list;                
      }

    });

    rooms[roomName] = new_room;
    bullets[roomName] = new_bullet_room;
    
    
    if (is_done) {return true;}

  });


  // removing empty rooms
  
  new_rooms = {};
  new_bullets = {};
  new_rooms_status = {};
  
  Object.keys(rooms).forEach(roomName => {
    let is_done = false;

    let room = rooms[roomName];
    let bullet_room = bullets[roomName];
    let status = rooms_status[roomName];
    
    if (Object.keys(room) == 0) {
      console.log('[ EMPTY ROOM ]'.red, '[ Removing room', roomName.red, ']\n');
      is_done = true;
    } else {
      // add active rooms
      new_rooms[roomName] = room;
      new_bullets[roomName] = bullet_room;
      new_rooms_status[roomName] = status;
    }

    if (is_done) {return true;}
  });

  // update rooms
  rooms = new_rooms;

  // update bullets
  bullets = new_bullets;

  // update rooms_status
  rooms_status = new_rooms_status;




  // alert everybody in the room

  // get removed player's room
  removed_player_room = rooms[removed_player_room_name];

  if (rooms.hasOwnProperty(removed_player_room_name)) {
    // send it good  
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

function send_aim(p, aim, roomName) {
  let room = rooms[roomName];

  // send notification to all players in room
  Object.keys(room).forEach(id => {

    let message = JSON.stringify(
      {
        type: 'set-aim',
        id: p['id'],
        name: p['name'],
        aim: aim,      
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
      angle: p['angle'],
      shots: p['shots'],
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

    });


    list.forEach(b => {

      let add = true;

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
          console.log(p.name, 'got hit!\n');
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

  let status = rooms_status[roomName];
  
  // update bullet positions, calculate collisions, etc.
  if (status['match_running'] && !status['match_over']) {    
    room_bullets = run_physics(roomName);  
  }

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


    // update room status
    update_room_status(roomName);  

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

  let room = rooms[roomName];

  // send notification to all players in room
  Object.keys(room).forEach(id => {

    let p = room[id];     

    let set_aim_message = JSON.stringify(
      {
        type: 'set-aim',
        id: p['id'],
        name: p['name'],
        aim: p['aim'],      
        room: roomName
      }
    )

    // need to check if connection is still open                
    if (client.readyState === WebSocket.OPEN) {
      // sending JSON        
      client.send(set_aim_message);
    } 
  });
}
