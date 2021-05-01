/*

**************** Player Class ****************

*/

class Player{
  // creates new player instance
  constructor(id, name, col, hit, x, y, vel, shots){
    // identification
    this.id = id;
    this.name = name;
    this.col = col; // color

    // position
    this.x = x;
    this.y = y;

    // vectors
    this.vel = vel;   // velocity
    this.aim = p5.Vector.fromAngle(0, 0);   // turret aim

    this.hit = hit; // player got hit

    this.shots = shots;
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
    rotate(-this.vel.heading()-Math.PI/2);
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

    rotate(+this.vel.heading()+Math.PI/2);
    // tank barrel
    rotate(+this.aim.heading());
    fill(color(0));
    rect(20, 0, 30, 6);
    fill(color(130));
    
    quad(15, 5, 15, -5, 5, -10, 5, 10);
    rect(33, 0, 9, 8);
    rotate(-this.aim.heading());

    // tank turret 
    strokeWeight(2);
    rotate(-this.vel.heading()-Math.PI/2);
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
  
    if (!this.hit && this.id == user.id) {
      // drawing reload bar
      // if (this.reloading) {
        this.draw_reload_bar();
      // } 
      // if (this.cooldown) {        
        this.draw_cooldown_bar();
      // }
      // draw bar displaying number of remaining shots
      this.draw_shots_bar();
    }   
      
    
  }

  
  draw_cooldown_bar() {

    let b_list = this.shots;
  
    if (!this.reloading && b_list.length != 0 && this.cooldown) {
      strokeWeight(2);
      stroke(color(220));
      rectMode(CENTER);
      fill('#ffaa66');
      rect(this.x, this.y-60, 70, 10);
  
      let ratio = (Date.now() - b_list[b_list.length-1].time)/bullet_interval;
      // console.log(ratio);
      fill(color(49, 191, 6));
      rectMode(CORNER);
      if (ratio <= 1) {  
        // noStroke();  
        rect(this.x-35, this.y-65, 70*ratio, 10);  
      } 
      else {
        this.cooldown = false;
      }
    }
    
  }
  
  draw_shots_bar() {
  
    let b_list = this.shots;
  
    strokeWeight(2);
    stroke(color(220));
    rectMode(CENTER);
    fill('#ffaa66');
    rect(this.x, this.y-70, 70, 10);
  
    let ratio;
  
    ratio = b_list.length/max_shots;
  
    // console.log(ratio);
    fill(color(5, 113, 255));
    rectMode(CORNER);
    if (ratio <= 1) {  
      // noStroke();  
      rect(this.x-35, this.y-75, 70*(1-ratio), 10);  
    } 
    if (ratio == 0) {
      this.reloading = true;
    }
  
  }
  
  draw_reload_bar() {

    let b_list = this.shots;

    if (this.reloading && b_list.length != 0) {
      let b_list = this.shots;
  
      strokeWeight(2);
      stroke(color(220));
      rectMode(CENTER);
      fill('#ffaa66');
      rect(this.x, this.y-60, 70, 10);
    
      let ratio = (Date.now() - b_list[b_list.length-1].time)/reload_interval;
      // console.log(ratio);
      fill('#ff0000');
      rectMode(CORNER);
      if (ratio <= 1) {    
        rect(this.x-35, this.y-65, 70*ratio, 10);  
      } else {
        this.reloading = false;
      }
    }
  
  
  }
  
}