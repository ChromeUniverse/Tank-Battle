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
      fill('#751f05');      
      rect(0, 0, tankW, tankH, 5, 5);
    } else {

      // highlight user with a thin dark border
      if (this.id == user.id) {
        strokeWeight(5);
        stroke('#2a27b5');            
        fill(0,0,0,0);
        ellipse(0, 0, 80, 80);  
      } 

      noStroke();
      fill(this.col);      
      rect(0, 0, tankW, tankH, 5, 5);                   
      
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
    strokeWeight(2);
    rotate(-this.vel.heading());
    fill(color(100));
    ellipse(0,0, 25, 25);
    noStroke();
    fill('#FFFFFF');
    triangle(-3, -4, -3, 4, 5, 0);
    

    pop();
    
    
    // show player name 
    noStroke();
    textSize(20);
    fill(color(255));
    textAlign(CENTER, BOTTOM);
    text(this.name, this.x, this.y+tankH/2+40);  


    if (this.id == user.id) {
      // drawing reload bar
      if (this.reloading) {
        draw_reload_bar(this);
      } 
      if (this.cooldown) {
        draw_cooldown_bar(this);
      }
      // draw bar displaying number of reamining shots
      draw_shots_bar(this);
    }

    
    
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