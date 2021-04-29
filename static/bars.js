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
