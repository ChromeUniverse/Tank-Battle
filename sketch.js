/*

**************** Constant Variables ****************

*/

// canvas properties
const canvasW = 600; 
const canvasH = 530;

// thingy dimensions
const thingyW = 40;
const thingyH = 40;

// player speed
const speedX = 4;
const speedY = 4;

// bullet parameters
const bullet_speed = 7;
const bullet_interval = 400;
const bullet_diam = 20;


// local list of players
let players = [];
let bullets = [];

/*

**************** Player Class ****************

*/

class Player{
  // creates new player instance
  constructor(id, name, col, x, y){
    this.id = id;
    this.name = name;
    this.col = col; // color
    this.x = x;
    this.y = y;
    this.hit = false;
  
  }

  // renders the player on the canvas
  display() {
    
    // highlight user with a thin white border
    if (this.id == user.id) {
      strokeWeight(3);
      stroke('rgb(38, 38, 61)');
    } else {
      noStroke();
    }
    
    if (this.hit) {
      // draw thingy
      fill('#FF0000');      
    } else {
      // draw thingy
      fill(this.col);
    }
    rectMode(CENTER);
    rect(this.x, this.y, thingyW, thingyH, 10, 10);
    

    noStroke();
    // show player name 
    textSize(20);
    fill(color(255));
    textAlign(CENTER, BOTTOM);
    text(this.name, this.x, this.y+thingyH/2+30);  
    
  }

  top() {return this.y - thingyH/2}
  left() {return this.x - thingyW/2}
  bottom() {return this.y + thingyH/2}
  right() {return this.x + thingyW/2}

  colliding(p2) {
    if ( this.top() > p2.bottom() || this.right() < p2.left() || this.bottom() < p2.top() || this.left() > p2.right() ) {
      return false;
    } else {
      return true;
    }
  } 
}


/*

**************** Bullet Setup ****************

*/

class Bullet {
  constructor(p, time, vel) {
    this.id = p.id;       // -> ID of player who shot bullet
    this.name = p.name;   // -> name of player who shot bullet
    this.col = p.col;
    this.x = p.x + 5*vel.x;
    this.y = p.y + 5*vel.y;
    // this.x = p.x;
    // this.y = p.y;
    this.time = time;   // -> time the bullet was shot
    this.vel = vel;     // -> velocity vector
    this.bounces = 0;    
    
  }

  // check for collisions
  colliding(thing){    
    // vector between player and thing
    let dist = createVector(thing.x-this.x, thing.y-this.y);

    // bullet collided with a player
    if (thing instanceof Player) {            
      let deltaX = abs(dist.x);
      let deltaY = abs(dist.y);

      if (deltaX < (thingyW + bullet_diam)/2 && deltaY < (thingyH + bullet_diam)/2 ) {      
        return true;      
      } else {
        return false;
      }
    }
  
    // bullet collided with another bullet
    if (thing instanceof Bullet) {
      let dist_mag = dist.mag();
      if (dist_mag < bullet_diam) {
        return true; 
      } else {
        return false;
      }
    } 
    
  }

  display() {
    // update position
    this.x += this.vel.x;
    this.y += this.vel.y;
    

    // draw bullet
    fill(this.col);
    ellipse(this.x, this.y, bullet_diam, bullet_diam);

    // reflecting velocity vector on bounce

    // top edge
    if (this.y <= bullet_diam/2) {      
      let new_vel = createVector(this.vel.x, -this.vel.y);  
      this.vel = new_vel;      
      this.bounces += 1;          
    }
    // left edge
    if (this.x <= bullet_diam/2) {
      let new_vel = createVector(-this.vel.x, this.vel.y);
      this.vel = new_vel;
      this.bounces += 1;
    }
    // bottom edge
    if (this.y >= canvasH-bullet_diam/2) {
      let new_vel = createVector(this.vel.x, -this.vel.y);
      this.vel = new_vel;
      this.bounces += 1;
    }
    // right edge
    if (this.x >= canvasW-bullet_diam/2) {
      let new_vel = createVector(-this.vel.x, this.vel.y);
      this.vel = new_vel;
      this.bounces += 1;
    }
    
    
  }

}




/*

**************** User Setup ****************

*/

// set random spawn position within canvas borders
let minX = thingyW;
let maxX = canvasW-thingyW;
let minY = thingyH;
let maxY = canvasH-thingyH;


const userID = 'Lucca';
const userName = 'Lucca';
const userColor = '#123456';

let userX = Math.floor(Math.random() * (maxX-minX) ) + minX;
let userY = Math.floor(Math.random() * (maxY-minY) ) + minY;

let user = new Player(userID, userName, userColor, userX, userY);
players.push(user);


let targetID = 'qrno'
let targetName = 'qrno';
let targetColor = '#f28500';

for (let i = 0; i < 8; i++) {
  let targetX = Math.floor(Math.random() * (maxX-minX) ) + minX;
  let targetY = Math.floor(Math.random() * (maxY-minY) ) + minY;

  let target = new Player(targetID, targetName, targetColor, targetX, targetY);
  players.push(target);
  
}






/*

**************** Functions ****************

*/



function shoot() {
  if (!user.hit) {
    let vel = createVector(mouseX - user.x, mouseY - user.y);
    let velNormal = vel.normalize();
    let velScaled = velNormal.mult(bullet_speed);

    if (bullets.length > 0) {
      // only add new bullet after [bullet_interval] seconds have passed
      let last_time = bullets[bullets.length-1].time;

      if ( Date.now() - last_time > bullet_interval ) {
        let bullet = new Bullet(user, Date.now(), velScaled);   
        bullets.push(bullet);
      }

    } else {
      let bullet = new Bullet(user, Date.now(), velScaled);   
      bullets.push(bullet);
    }
  }
  
}


// change user position based on keypresses
function keys() {
  let moved = false;
  let keystrokes = '';
  
  let x = user.x;
  let y = user.y;  

  if (keyIsDown(87)) {
    // w
    moved = true;
    keystrokes += 'w'; 
    y -= speedY; 
    if (y < thingyH/2) { y = thingyH/2; }   
  }
  if (keyIsDown(65)) {
    // a
    moved = true;
    keystrokes += 'a';
    x -= speedX; 
    if (x < thingyW/2) { x = thingyW/2; }
  }
  if (keyIsDown(83)) {
    // s
    moved = true;
    keystrokes += 's';
    y += speedY; 
    if (y > canvasH-thingyH/2) { y = canvasH-thingyH/2; }
  }
  if (keyIsDown(68)) {
    // d
    moved = true;
    keystrokes += 'd';
    x += speedX; 
    if (x > canvasW-thingyW/2) { x = canvasW-thingyW/2; }
  }
  
  if (mouseIsPressed){
    // shoot ball when mouse is pressed    
    shoot();
  }

  if (!user.hit) {
    user.x = x;
    user.y = y;  
  }
  
  return [moved, keystrokes];

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

  keys(); 

  players.forEach(p => {
    if (user.colliding(p)) {
      if (p.id != user.id){
        console.log(user.name + ' collided with ' + p.name);
      }
    } 
  });

  // let render = [];
  
  // Object.values(players).forEach(p => {
  //   render.push(p);
  // });

  // // layering
  // render.sort(inFront);

  players.sort(inFront);
  players.forEach(p => {
    p.display();    
  });


  // removing bullets
  bullets_copy = [];

  // update positions and draw them
  bullets.forEach(b => {    
    b.display();
  });

  // checking for collisions
  bullets.forEach(b => {        

    let add;

    if (b.bounces < 3) {      
      add = true;
    }  

    // bullet X player
    players.forEach(p => {
      if (b.colliding(p)){        

        if (b.id != p.id) {
          console.log(b.name + "'s bullet hit " + p.name);
          p.hit = true;
          add = false;
        } 
        
        else {
          console.log(b.name + ' is dead!');
          p.hit = true;
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