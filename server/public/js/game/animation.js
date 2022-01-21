/*

**************** Animation Class ****************

*/


class Animation {
  constructor(x, y, radius, duration) {
    this.x = x;                   // coordinates
    this.y = y;
    this.radius = radius;
    this.duration = duration;     // animation duration in milliseconds
    this.start_time = Date.now();
  }
  
  display() {
    
    strokeWeight(5);
    stroke('#fa7500');
    fill('#fae100');
    
    let ratio = (Date.now()-this.start_time)/this.duration;
    
    if (ratio <= 0.5 ) {
      ellipse(this.x, this.y, this.radius*2*ratio, this.radius*2*ratio); 
    } else if (ratio > 0.5 && ratio <= 1){
      rectMode(CENTER);  
      rect(this.x, this.y, this.radius*2*(1-ratio), this.radius*2*(1-ratio));
    } 
    noStroke();
    
  }

  
}
