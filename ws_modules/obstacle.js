class Obstacle {
  constructor(x, y, w, h, col) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.col = col;
  }

  // get edges
  top() {return this.y}
  left() {return this.x}
  bottom() {return this.y + this.h;}
  right() {return this.x + this.w;}

}

function createObstables() {

  let boxes = [];

  // creating obstacles
  boxes.push(new Obstacle(200, 200, 100, 100, '#7a7a7a'));
  boxes.push(new Obstacle(200, 300, 100, 100, '#7a7a7a'));
  boxes.push(new Obstacle(200, 400, 100, 100, '#7a7a7a'));
  boxes.push(new Obstacle(200, 400, 100, 100, '#7a7a7a'));
  boxes.push(new Obstacle(200, 400, 100, 100, '#7a7a7a'));
  boxes.push(new Obstacle(300, 400, 100, 100, '#7a7a7a'));
  boxes.push(new Obstacle(300, 400, 100, 100, '#7a7a7a'));
  boxes.push(new Obstacle(400, 400, 100, 100, '#7a7a7a'));
  boxes.push(new Obstacle(500, 400, 100, 100, '#7a7a7a'));
  boxes.push(new Obstacle(500, 400, 100, 100, '#7a7a7a'));
  boxes.push(new Obstacle(500,  50, 100, 100, '#7a7a7a'));
  boxes.push(new Obstacle(800, 400, 100, 100, '#7a7a7a'));
  boxes.push(new Obstacle(800, 300, 100, 100, '#7a7a7a'));
  boxes.push(new Obstacle(800, 200, 200, 100, '#7a7a7a'));
  boxes.push(new Obstacle(900, 150, 100,  50, '#7a7a7a'));
  
  return boxes;
}

module.exports = { Obstacle, createObstables };