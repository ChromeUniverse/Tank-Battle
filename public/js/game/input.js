function input(p) {
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