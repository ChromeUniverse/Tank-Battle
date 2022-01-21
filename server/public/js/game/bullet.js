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
