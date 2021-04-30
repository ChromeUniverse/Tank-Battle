/*

**************** Obstacle Class ****************

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