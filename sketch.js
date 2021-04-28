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
const player_speed = 4;
const rotation_speed = 4;

// bullet parameters
const bullet_speed = 7;
const bullet_interval = 350;
const bullet_diam = 15;
const reload_interval = 2000;
const maxBounces = 4;
const max_shots = 5;


// local list of players
let players = [];
let bullets = [];
let obstacles = [];

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

  // renders the player on the canvas
  display() {
    
    // highlight user with a thin black border
    if (this.id == user.id) {
      strokeWeight(3);
      stroke('rgb(38, 38, 61)');
    } else {
      noStroke();
    }

    /*
    noStroke();
    fill('#FF0000');
    ellipse(this.x, this.y, hit_radius*2, hit_radius*2);
    */
    
    
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

    // check for collisions with all obstacles
    obstacles.forEach(box => {
      this.colliding(box);  
    });
      
    
  }

}





/*

**************** Bullet Class ****************

*/


class Obstacle {
  constructor(x, y, w, h, col) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.col = col;
  }

  display() {
    rectMode(CORNER);
    noStroke();
    fill(this.col);
    rect(this.x, this.y, this.w, this.h);
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

const userID = 'Lucca';
const userName = 'Lucca';
const userColor = '#2ba9c2';

let userX = Math.floor(Math.random() * (maxX-minX) ) + minX;
let userY = Math.floor(Math.random() * (maxY-minY) ) + minY;

let vel_vector = new p5.Vector.fromAngle(startAngle * (Math.PI/180), player_speed);
let user = new Player(userID, userName, userColor, userX, userY, vel_vector);
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

**************** Functions ****************

*/





function draw_cooldown_bar(p) {
  if (!user.reloading && user.bullets.length != 0) {
    strokeWeight(2);
    stroke(color(220));
    rectMode(CENTER);
    fill('#ffaa66');
    rect(p.x, p.y-60, 70, 10);

    let ratio = (Date.now() - user.bullets[user.bullets.length-1].time)/bullet_interval;
    // console.log(ratio);
    fill(color(49, 191, 6));
    rectMode(CORNER);
    if (ratio <= 1) {  
      // noStroke();  
      rect(p.x-35, p.y-65, 70*ratio, 10);  
    } else {
      p.cooldown = false;
    }
  }
  
}

function draw_shots_bar(p) {
  strokeWeight(2);
  stroke(color(220));
  rectMode(CENTER);
  fill('#ffaa66');
  rect(p.x, p.y-70, 70, 10);

  let ratio = user.bullets.length/max_shots;
  // console.log(ratio);
  fill(color(5, 113, 255));
  rectMode(CORNER);
  if (ratio <= 1) {  
    // noStroke();  
    rect(p.x-35, p.y-75, 70*(1-ratio), 10);  
  } else {
    p.reloading = false;
  }

}

function draw_reload_bar(p) {
  strokeWeight(2);
  stroke(color(220));
  rectMode(CENTER);
  fill('#ffaa66');
  rect(p.x, p.y-60, 70, 10);

  let ratio = (Date.now() - user.bullets[user.bullets.length-1].time)/reload_interval;
  // console.log(ratio);
  fill('#ff0000');
  rectMode(CORNER);
  if (ratio <= 1) {    
    rect(p.x-35, p.y-65, 70*ratio, 10);  
  } else {
    p.reloading = false;
    user.bullets = [];
  }
}



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
        user.reloading = true;
        // do nothing for [reload_timeout] milliseconds
        if (Date.now() - last_time > reload_interval) {
          // reset user's bullets
          user.bullets = [];
          user.reloading = false;
        }        
        
      } else {
        if ( Date.now() - last_time > bullet_interval ) {
          user.reloading = false;
          user.cooldown = true;
          let bullet = new Bullet(user, Date.now(), velScaled);   
          bullets.push(bullet);
          user.bullets.push(bullet);
          
        }
      }

      // user.bullets[user.bullets.length()-1];


    } else {
      user.reloading = false;
      user.cooldown = true;
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
      p.vel.setHeading(angle + rotation_speed * (Math.PI/180));
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
      p.vel.setHeading(angle - rotation_speed * (Math.PI/180));
    }
    
    // canvas borders
    x = max(x, hit_radius);
    x = min(x, canvasW-hit_radius);
    y = max(y, hit_radius);
    y = min(y, canvasH-hit_radius);

    // checking for obstacle collision
    
    obstacles.forEach(box => {
      let result = box.colliding(user);
      if (result != false){
        x += result[0];
        y += result[1];
      }
    });

    // checking for player collision

    players.forEach(p => {
      if (p.id != user.id) {
        let result = p.colliding(user);
        if (result != false && !p.hit){
          x += result[0];
          y += result[1];
        }
      }
    });

    
    
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
    }  

    // bullet X player
    players.forEach(p => {
      if (b.colliding(p) && !p.hit){ 
      // if (b.colliding(p)){        

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