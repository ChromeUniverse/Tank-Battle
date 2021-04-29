/*

**************** Constant Variables ****************

*/

// canvas properties
const canvasW = 1200; 
const canvasH = 600;

// thingy dimensions
const thingyW = 60;
const thingyH = 40;

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

// containers
let players = [];
let bullets = [];
let obstacles = [];
let animations = []



/*

**************** Setup ****************

*/





// set random spawn position within canvas borders
let minX = hit_radius;
let maxX = canvasW-hit_radius;
let minY = hit_radius;
let maxY = canvasH-hit_radius;
let startAngle = Math.floor(Math.random() * 360);


// creating user

let userX = Math.floor(Math.random() * (maxX-minX) ) + minX;
let userY = Math.floor(Math.random() * (maxY-minY) ) + minY;

let vel_vector = new p5.Vector.fromAngle(startAngle * (Math.PI/180), player_speed);
let user = new Player('123412341234', userName, userColor, userX, userY, vel_vector);
players.push(user);


// creating targets


let targetID = 'qrno'
let targetName = 'qrno';
let targetColor = '#f28500';

let target = new Player(targetID, targetName, targetColor, 100, 100, p5.Vector.fromAngle(Math.floor(Math.random() * 360) * (Math.PI/180), player_speed));
players.push(target);
target = new Player(targetID, targetName, targetColor, 100, 400, p5.Vector.fromAngle(Math.floor(Math.random() * 360) * (Math.PI/180), player_speed));
players.push(target);
target = new Player(targetID, targetName, targetColor, 500, 350, p5.Vector.fromAngle(Math.floor(Math.random() * 360) * (Math.PI/180), player_speed));
players.push(target);
target = new Player(targetID, targetName, targetColor, 800, 120, p5.Vector.fromAngle(Math.floor(Math.random() * 360) * (Math.PI/180), player_speed));
players.push(target);
target = new Player(targetID, targetName, targetColor, 700, 500, p5.Vector.fromAngle(Math.floor(Math.random() * 360) * (Math.PI/180), player_speed));
players.push(target);
target = new Player(targetID, targetName, targetColor, 1100, 300, p5.Vector.fromAngle(Math.floor(Math.random() * 360) * (Math.PI/180), player_speed));
players.push(target);

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

  // get user input
  input(user); 

  // disable barrel aim if user is hit
  if (!user.hit) {
    // update barrel angle
    let aim_vector = createVector(mouseX-user.x, mouseY-user.y);
    user.aim = aim_vector;
  }


  obstacles.forEach(o => {
    o.display();
  });

  // let render = [];
  
  // Object.values(players).forEach(p => {
  //   render.push(p);
  // });

  // // layering
  // render.sort(inFront);

  // drawing players on screen

  players.sort(inFront);
  players.forEach(p => {
    p.display();    
  });

  animations.forEach(a => {
    a.display();
  });

  // removing bullets
  bullets_copy = [];

  // update positions and draw them
  bullets.forEach(b => {    
    b.display();
  });

  
  // drawing reload bar
  if (user.reloading) {
    draw_reload_bar(user);
  } 
  if (user.cooldown) {
    draw_cooldown_bar(user);
  }
  // draw bar displaying number of reamining shots
  draw_shots_bar(user);
  


  // checking for bullet collisions
  bullets.forEach(b => {        

    let add; // bool

    if (b.bounces < maxBounces) {      
      add = true;
    } else {
      animations.push(new Animation(b.x, b.y, bullet_explosion_radius, bullet_explosion_duration));
    }

    // bullet X player
    players.forEach(p => {
      if (b.colliding(p) && !p.hit){ 
      // if (b.colliding(p)){        

        if (b.id != p.id) {
          console.log(b.name + "'s bullet hit " + p.name);
          p.hit = true;
          animations.push(new Animation(p.x, p.y, explosion_radius, explosion_duration));
          add = false;
        } 
        
        else {
          console.log(b.name + ' is dead!');
          p.hit = true;
          animations.push(new Animation(p.x, p.y, explosion_radius, explosion_duration));
          add = false;
        }        

      }      
    }); 
    
    // bullet X bullet
    bullets.forEach(b2 => {
      if (b.colliding(b2)){
        // don't compare bullet with itself        
        if (b.x != b2.x && b.y != b2.y) {
          console.log("Bullets collided!");
          animations.push(new Animation(b.x, b.y, bullet_explosion_radius, bullet_explosion_duration));
          add = false;
        }
      }      
    });

    if (add) {
      bullets_copy.push(b); 
    } 

  });

  bullets = bullets_copy;

}