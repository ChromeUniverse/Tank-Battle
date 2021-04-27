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
const speedX = 4;
const speedY = 4;
const player_speed = 2;

// bullet parameters
const bullet_speed = 3;
const bullet_interval = 400;
const bullet_diam = 20;
const reload_interval = 2000;
const max_shots = 3;


// local list of players
let players = [];
let bullets = [];

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
  }

  // renders the player on the canvas
  display() {
    
    // highlight user with a thin black border
    if (this.id == user.id) {
      strokeWeight(3);
      stroke('rgb(38, 38, 61)');
    } else {
      noStroke();
    }


    // fill('#FF0000');
    // ellipse(this.x, this.y, hit_radius*2, hit_radius*2);
    
    
    push();
    translate(this.x, this.y);
    rotate(-this.vel.heading());
    rectMode(CENTER);

    // tank treads
    noStroke()
    fill(color(0));
    rect(0, 20, 50, 10, 2, 2);
    fill(color(0));
    rect(0, -20, 50, 10, 2, 2);

    // tank body
    if (this.hit) {
      fill('#FF0000');      
      rect(0, 0, thingyW, thingyH, 5, 5);
    } else {
      fill(this.col);
      rect(0, 0, thingyW, thingyH, 5, 5);             
    }  
    fill('#FF0000')
    ellipse(0,0,5,5);

    rotate(+this.vel.heading());
    // tank barrel
    rotate(this.aim.heading());
    fill(color(0));
    rect(20, 0, 30, 6);
    fill(color(130));
    
    quad(15, 5, 15, -5, 5, -10, 5, 10);
    rect(33, 0, 9, 8);
    rotate(-this.aim.heading());

    // tank turret 
    
    rotate(-this.vel.heading());
    fill(color(100));
    ellipse(0,0, 25, 25);
    fill('#FFFFFF');
    triangle(-3, -4, -3, 4, 5, 0);
    

    pop();
    
    
    // show player name 
    noStroke();
    textSize(20);
    fill(color(255));
    textAlign(CENTER, BOTTOM);
    text(this.name, this.x, this.y+thingyH/2+30);  
    
    
  }

  /*
  // edge helper function
  top() {return this.y - thingyH/2}
  left() {return this.x - thingyW/2}
  bottom() {return this.y + thingyH/2}
  right() {return this.x + thingyW/2}

  // check for collision with other players
  colliding(p2) {
    if ( this.top() > p2.bottom() || this.right() < p2.left() || this.bottom() < p2.top() || this.left() > p2.right() ) {
      return false;
    } else {
      return true;
    }
  } 
  */
}


/*

**************** Bullet Setup ****************

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
    // vector between player and thing
    let dist = createVector(thing.x-this.x, thing.y-this.y);
    let dist_mag = dist.mag();

    // bullet collided with a player
    if (thing instanceof Player) {            
      /*
      let deltaX = abs(dist.x);
      let deltaY = abs(dist.y);      
      if (deltaX < (thingyW + bullet_diam)/2 && deltaY < (thingyH + bullet_diam)/2 ) {      
        return true;      
      } else {
        return false;
      }
      */

      if (dist_mag < hit_radius+bullet_diam/2) {
        return true; 
      } else {
        return false;
      }
    }
  
    // bullet collided with another bullet
    if (thing instanceof Bullet) {      
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


// creating user

const userID = 'Lucca';
const userName = 'Lucca';
const userColor = '#123456';

// let userX = Math.floor(Math.random() * (maxX-minX) ) + minX;
// let userY = Math.floor(Math.random() * (maxY-minY) ) + minY;
let userX = 200;
let userY = 200;

let vel_vector = new p5.Vector.fromAngle(90 * (Math.PI/180), player_speed);
let user = new Player(userID, userName, userColor, userX, userY, vel_vector);
players.push(user);


// creating targets

let targetID = 'qrno'
let targetName = 'qrno';
let targetColor = '#f28500';

for (let i = 0; i < 5; i++) {
  let targetX = Math.floor(Math.random() * (maxX-minX) ) + minX;
  let targetY = Math.floor(Math.random() * (maxY-minY) ) + minY;

  let target = new Player(targetID, targetName, targetColor, targetX, targetY, p5.Vector.fromAngle(0 * (Math.PI/180), player_speed) );
  players.push(target);
  
}






/*

**************** Functions ****************

*/



function shoot() {
  // do nothing if user is hit
  if (!user.hit) {
    let vel = createVector(mouseX - user.x, mouseY - user.y);
    let velNormal = vel.normalize();
    let velScaled = velNormal.mult(bullet_speed);

    if (user.bullets.length > 0) {
      // only add new bullet after [bullet_interval] milliseconds have passed
      let last_time = user.bullets[user.bullets.length-1].time;

      // timeout after three shots to "reload"
      if (user.bullets.length == max_shots) {   
        console.log('Reloading!')     
        // do nothing for [reload_timeout] milliseconds
        if (Date.now() - last_time > reload_interval) {
          // reset user's bullets
          user.bullets = [];
        }        
        
      } else {

        if ( Date.now() - last_time > bullet_interval ) {
          let bullet = new Bullet(user, Date.now(), velScaled);   
          bullets.push(bullet);
          user.bullets.push(bullet);
        }
      }

      // user.bullets[user.bullets.length()-1];


    } else {
      let bullet = new Bullet(user, Date.now(), velScaled);   
      bullets.push(bullet);
      user.bullets.push(bullet);
    }
  }
  
}


// change user position based on keypresses
function keys(p) {
  let moved = false;
  let keystrokes = '';
  
  let x = p.x;
  let y = p.y;  
  let angle = p.vel.heading();

  // trigerred on key presses
  if (!user.hit) {
    if (keyIsDown(87)) {
      // w -> forward
      moved = true;
      keystrokes += 'w'; 
      x += p.vel.x;
      y -= p.vel.y;
    }
    if (keyIsDown(65)) {
      // a -> turn CCW
      moved = true;
      keystrokes += 'a';
      p.vel.setHeading(angle + 2 * (Math.PI/180));
    }
    if (keyIsDown(83)) {
      // s -> backward
      moved = true;
      keystrokes += 'w'; 
      x -= p.vel.x;
      y += p.vel.y;
    }
    if (keyIsDown(68)) {
      // d -> turn CW
      moved = true;
      keystrokes += 'a';
      p.vel.setHeading(angle - 2 * (Math.PI/180));
    }
    
    // canvas borders
    if (x < thingyW/2) {x = thingyW/2;}
    if (x > canvasW-thingyW/2) {x = canvasW-thingyW/2;}
    if (y < thingyH/2) {y = thingyH/2;}
    if (y > canvasH-thingyH/2) {y = canvasH-thingyH/2;}

    // update position
    user.x = x;
    user.y = y;
  }
  
  // shoot projectile when mouse is pressed    
  if (mouseIsPressed){   
    shoot();
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

  // get user input
  keys(user); 


  // update barrel angle
  if (!user.hit) {
    let aim_vector = createVector(mouseX-user.x, mouseY-user.y);
    user.aim = aim_vector;
  }
  
  /*
  // checking for player colisions
  players.forEach(p => {
    if (user.colliding(p)) {
      if (p.id != user.id){
        console.log(user.name + ' collided with ' + p.name);
      }
    } 
  });
  */

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


  // removing bullets
  bullets_copy = [];

  // update positions and draw them
  bullets.forEach(b => {    
    b.display();
  });

  // checking for bullet collisions
  bullets.forEach(b => {        

    let add;

    if (b.bounces < 3) {      
      add = true;
    }  

    // bullet X player
    players.forEach(p => {
      // if (b.colliding(p) && !p.hit){ 
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