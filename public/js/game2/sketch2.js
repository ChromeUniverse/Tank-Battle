/*

**************** Constants ****************

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
const server = 'localhost';
// const server = '192.168.1.116';
// const server = '18.229.196.24';
// const server = '192.168.1.109';
// const server = '34.200.98.64';
// const server = '18.229.74.58';

const port = 2000;


// containers
let players = {};
let bullets = [];
let obstacles = [];
let animations = [];
let message = {
  text: '',
  duration: 0,
  start_time: Date.now()
};

let local = {
  name: 'name', 
  x: 0,
  y: 0,
  heading: 0,
  aim: 0,
}

// const roomName = 'testroom';

// in SECONDS!
const pre_match_time = 6;     
const post_match_time = 6;  


/*

**************** Setup ****************

*/

// creating obstacles boxes

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

// new websocket connection

const ws = new WebSocket('ws://' + server + ':' + port.toString());

// on connection
ws.addEventListener("open", () => {
  console.log("Connected to WS Server!",'@', server, port);  
  send_spectate();
  get_name();
});


// WS messages
ws.addEventListener("message", msg => {
  const dataJson = JSON.parse(msg.data);
  const type = dataJson['type'];

  if (type == 'set-name') {
    console.log('Got name!', dataJson.name);
    local.name = dataJson.name;
  }
  
  if (type == 'room-update') {
    players = dataJson.players;
    bullets = dataJson.bullets;

    for (const p of Object.values(players)) {
      if ( p.name == local.name ) {
        local.x = p.x;
        local.y = p.y;
        local.heading = p.heading;
      }
    }
  }

  if (type == 'animation') {

    let radius;
    let duration;

    if (dataJson.animation == 'player-explode') {
      radius = explosion_radius;
      duration = explosion_duration;
    } 

    if (dataJson.animation == 'bullet-explode') {
      radius = bullet_explosion_radius;
      duration = bullet_explosion_duration;
    } 

    animations.push(new explodeAnimation(dataJson.x, dataJson.y, radius, duration));
  }

  if (type == 'match-update') {

    let text = '';
    let state = dataJson.state;

    if (state == 'waiting') text = 'Waiting for players to join...';
    if (state == 'pre-match') text = 'Match starting soon!';
    if (state == 'playing') text = 'Go!';
    if (state == 'post-match') text = 'Game over!';

    const newmessage = {
      text: text,
      duration: 1000,
      start_time: Date.now(),
    }
    message = newmessage;
    console.log('Got State!', dataJson.state);
  }

  if (type == 'room-full') {
    const newmessage = {
      text: dataJson.message,
      duration: 1000,
      start_time: Date.now(),
    }
    message = newmessage;
  }

  if (type == 'match-in-progress') {
    const newmessage = {
      text: dataJson.message,
      duration: 1000,
      start_time: Date.now(),
    }
    message = newmessage;
  }

  if (type == 'time') {
    const newmessage = {
      text: dataJson.message,
      duration: 1000,
      start_time: Date.now(),
    }
    message = newmessage;
    console.log(dataJson.message);
  }

  if (type == 'kill') {
    
    let text;

    if (dataJson.dead_name == dataJson.killer_name) {
      text = dataJson.dead_name + ' killed themselves!';
    } else {
      text = dataJson.killer_name + ' killed ' + dataJson.dead_name + ' !';
    }

    const newmessage = {
      text: text,
      duration: 1000,
      start_time: Date.now(),
    }
    message = newmessage;
    console.log(dataJson.message);
  }

  if (type == 'win') {
    const newmessage = {
      text: dataJson.winner_name + ' wins!',
      duration: 1000,
      start_time: Date.now(),
    }
    message = newmessage;
    console.log(dataJson.message);
  }

});


function get_aim() {
  const aim = createVector(mouseX-local.x, mouseY-local.y); 
  return aim.heading();
}

// send 'spectate rooms' request
function send_spectate()  { ws.send( JSON.stringify( { type: 'spectate', room: roomName } )); }

// send 'join room' request
function send_joinroom()  { ws.send( JSON.stringify( { type: 'play', room: roomName }     )); }

function get_name()       { ws.send( JSON.stringify( { type: 'get-name' } )); }

// send user input
function send_input(keys, aim) { 
  ws.send( JSON.stringify( { type: 'input', keys: keys, aim: aim } )); 
  console.log('sent keys!');
}

// process keypresses
function keys() {

  let keystrokes = '';
  let pressed = false;
  let aim = 0;
  
  // w or up 
  if (keyIsDown(87) || keyIsDown(UP_ARROW)) { 
    keystrokes += 'w'; 
    pressed = true; 
  }
  // a or left
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) {
    keystrokes += 'a';
    pressed = true;
  }  
  // s or down
  if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) {
    keystrokes += 's';
    pressed = true;
  } 
  // d or right
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) {
    keystrokes += 'd';
    pressed = true;
  }
  // mouse click or enter
  if (mouseIsPressed || keyIsDown(13)) {    
    keystrokes += 'z';
    aim = get_aim();
    pressed = true;
  }
  
  if (pressed) send_input(keystrokes, aim);
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

function display_message(message){
  if (Date.now() - message.start_time < message.duration) {
    fill('#000000');
    textSize(30);
    textFont('Courier New');
    text(message.text, canvasW/2, 45);
  }
}

function drawPlayer(p) {
  // fill(p.color);
  // circle(p.x, p.y, 2 * hit_radius);

  // highlight user with a thin dark border
  if (p.name == local.name) {
    strokeWeight(5);
    stroke('#2a27b5');            
    fill(0,0,0,0);
    circle(p.x, p.y, 80);  
    p.aim = get_aim();
  } 

  push();
  translate(p.x, p.y);
  rotate(p.heading);
  rectMode(CENTER);

  // tank treads
  noStroke()
  fill(color(0));
  rect(0, 20, 50, 10, 2, 2);
  fill(color(0));
  rect(0, -20, 50, 10, 2, 2);

  // tank body
  if (p.hit) fill('#751f05')
  else fill(p.color)

  rect(0, 0, tankW, tankH, 5, 5);

  fill('#FF0000');
  ellipse(0, 0, 5, 5);
  rotate(-p.heading);

  // tank cannon/barrel
  rotate(p.aim);
  fill(color(0));
  rect(20, 0, 30, 6);
  fill(color(130));

  quad(15, 5, 15, -5, 5, -10, 5, 10);
  rect(33, 0, 9, 8);
  rotate(-p.aim);

  // tank turret 
  strokeWeight(2);
  rotate(p.heading);
  fill(color(100));
  ellipse(0, 0, 25, 25);
  noStroke();
  fill('#FFFFFF');
  triangle(-3, -4, -3, 4, 5, 0);
  pop();

  // show player name 
  noStroke();
  textSize(20);
  fill(color(255));
  textAlign(CENTER, BOTTOM);
  text(p.name, p.x, p.y + tankH / 2 + 40);
}

function display_players(){

  // setting up render queue
  let render = Object.values(players);

  // layering
  render.sort( (p1, p2) => {
    if (p1.y > p2.y)  return 1
    if (p1.y == p2.y) return 0
    if (p1.y < p2.y)  return -1
  });

  for (const player of render) { drawPlayer(player) }

}

function display_bullets(){

  // setting up render queue

  bullets.forEach(b => {
    noStroke();
    fill(b.color);
    circle(b.x, b.y, bullet_diam);
  });

}

function draw() {
  background(220);

  // process user input
  keys();
  
  obstacles.forEach(o => {
    o.display();
  });

  display_players();
  display_bullets();

  animations.forEach(a => {
    a.display();
  });

  display_message(message);

}