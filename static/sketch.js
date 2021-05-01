/*

**************** Constant Variables ****************

*/

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
const bullet_speed = 1;
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


// websockets server address
// const server = 'localhost';
// const server = '192.168.1.109';
// const server = '34.200.98.64';
const server = '18.229.74.58';


// containers
let players = {};
let bullets = {};
let obstacles = [];
let animations = []

const roomName = 'testroom';



/*

**************** Setup ****************

*/





// set random spawn position within canvas borders
let minX = hit_radius;
let maxX = canvasW-hit_radius;
let minY = hit_radius;
let maxY = canvasH-hit_radius;


// creating user

let userX = Math.floor(Math.random() * (maxX-minX) ) + minX;
let userY = Math.floor(Math.random() * (maxY-minY) ) + minY;

let vel_vector = new p5.Vector.fromAngle(0, player_speed);
console.log(vel_vector.heading() / (Math.PI/180));
let user = new Player('', userName, userColor, false, userX, userY, vel_vector, []);



// creating targets


let targetID = 'qrno'
let targetName = 'qrno';
let targetColor = '#f28500';

// creating obstacles

let box = new Obstacle(200, 200, 100, 100, '#7a7a7a');
obstacles.push(box);
box = new Obstacle(200, 300, 100, 100, '#7a7a7a');
obstacles.push(box);
box = new Obstacle(200, 400, 100, 100, '#7a7a7a');
obstacles.push(box);
box = new Obstacle(300, 400, 100, 100, '#7a7a7a');
obstacles.push(box);
box = new Obstacle(400, 400, 100, 100, '#7a7a7a');
obstacles.push(box);
box = new Obstacle(500, 400, 100, 100, '#7a7a7a');
obstacles.push(box);

box = new Obstacle(500, 50, 100, 100, '#7a7a7a');
obstacles.push(box);

box = new Obstacle(800, 400, 100, 100, '#7a7a7a');
obstacles.push(box);
box = new Obstacle(800, 300, 100, 100, '#7a7a7a');
obstacles.push(box);
box = new Obstacle(800, 200, 200, 100, '#7a7a7a');
obstacles.push(box);
box = new Obstacle(900, 150, 100, 50, '#7a7a7a');
obstacles.push(box);



/*

**************** Websockets ****************

*/



// new websocket connection

const ws = new WebSocket('ws://' + server + ':2848');

// on connection
ws.addEventListener("open", () => {
  console.log("Connected to WS Server");  
});


ws.addEventListener("message", msg => {
  var dataJson = JSON.parse(msg.data);
  var dataType = dataJson['type'];

  // set user's unique ID
  if (dataType == 'set-id'){
    console.log('got id');
    let ID = dataJson['id'];
    user.id = ID;
    players[ID] = user;
    // send login data
    send_login();
  }


  // set room
  if (dataType == 'set-room'){
    if (dataJson['room-state'].length != 0) {
      // looping through players in room state
      Object.values(dataJson['room-state']['players']).forEach(p=>{
        let ID = p['id'];

        if (ID != user.id) {
          // create new players and add them to list
          newPlayer = new Player(
            p['id'], 
            p['name'], 
            p['color'],
            p['hit'],
            p['x'], 
            p['y'],
            p5.Vector.fromAngle(p['angle'], player_speed),
            []            
          );
          players[ID] = newPlayer;
        }        
      });

      // set bullets
      bullets = dataJson['room-state']['bullets'];

    } else {
      console.log('room is empty');
    }
  }

  // update room state
  if (dataType == 'room-update'){

    let room = dataJson['room-state']['players'];

    // looping over entries 
    Object.values(room).forEach(entry => {
      let player_id = entry['id'];

      if ( players.hasOwnProperty(player_id)) {
        // update player attributes on local player list
        let player = players[player_id];
        player.x = entry['x'];
        player.y = entry['y'];
        player.vel.setHeading(-entry['angle']);
        player.shots = entry['shots'];
      }
    });

    // update bullet list
    bullets = dataJson['room-state']['bullets'];
    // console.log(dataJson['room-state']);
    
  }

  if (dataType == 'new-player') {new_player(dataJson);}

  if (dataType == 'delete-player') {delete_player(dataJson);}

  if (dataType == 'player-hit') {
    let hit_id = dataJson['id'];
    let hit_name = dataJson['name'];
    console.log(hit_name + 'was hit!');

    // update hit variable
    let p = players[hit_id];
    p.hit = true;

    // play animation
    animations.push(new Animation(p.x, p.y, explosion_radius, explosion_duration));
  }
  
  if (dataType == 'bullet-explode') {
    let x = dataJson['x'];
    let y = dataJson['y'];

    // play animation
    animations.push(new Animation(x, y, bullet_explosion_radius, bullet_explosion_duration));
  }

});








/*

**************** WS Functions ****************

*/





// send login data
function send_login() {
  ws.send(
    JSON.stringify(
      {
        type: 'login',
        id: user.id,
        name: user.name,
        color: user.col,
        x: user.x,
        y: user.y,
        angle: user.vel.heading(),
        room: roomName
      }
    )
  );
}



// sends keystrokes to server
function sendKeys(keystrokes) {
  ws.send(
    JSON.stringify(
      {
        type: 'move',
        id: user.id, 
        name: user.name,
        keys: keystrokes,
        room: roomName
      }
    )
  );
}



// sends bullet information to server
function sendBullet(){
  console.log('Bang!')  
  ws.send(
    JSON.stringify(
      {
        type: 'shoot',
        id: user.id, 
        name: user.name,
        color: user.col,
        aim: user.aim.heading(),
        room: roomName
      }
    )
  );
}




// process keypresses
function keys() {

  let moved = false;
  let shoot = false;
  let keystrokes = '';
  
  // w or up 
  if (keyIsDown(87) || keyIsDown(UP_ARROW)) {
    moved = true;
    keystrokes += 'w';    
  }
  // a or left
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) {
    moved = true;
    keystrokes += 'a';
  }
  // s or down
  if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) {
    moved = true;
    keystrokes += 's';
  } 
  // d or right
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) {
    moved = true;
    keystrokes += 'd';
  }
  // mouse click or enter
  if (mouseIsPressed || keyIsDown(13)) {
    shoot = true;    
    user.cooldown = true;
  }
  
  if (moved) { sendKeys(keystrokes); }

  if (shoot) { sendBullet(); }
}






/*

**************** Main Program ****************

*/


// Main setup function
function setup() {
  // set up canvas
  let canvas = createCanvas(canvasW, canvasH);
  canvas.parent('canvas');

}


// player layering
function inFront(p1, p2){
  if (p1.y > p2.y)  return 1
  if (p1.y == p2.y) return 0
  if (p1.y < p2.y)  return -1
}


function draw() {
  background(220);

  // process user input
  keys();
  
  // console.log(user);

  let p = players[user.id];  

  if (!user.hit && user.id != '') {user.aim = createVector(mouseX-p.x, mouseY-p.y);}

  // strokeWeight(2);
  // stroke('#ff0000');
  // line(mouseX, mouseY, user.x, user.y);
  

  obstacles.forEach(o => {
    o.display();
  });


  // drawing players on screen
  let render = [];
  // console.log(players);
  
  Object.values(players).forEach(p => {
    render.push(p);
  });

  // layering
  render.sort(inFront);

  render.forEach(p => {
    p.display();
  })

 
  
  animations.forEach(a => {
    a.display();
  });

  
  // draw all bullets
  Object.values(bullets).forEach(list => {
    
    list.forEach(b => {
      noStroke();
      fill(b['color']);
      ellipse(b['x'], b['y'], bullet_diam, bullet_diam);  
    });
    
  });
}