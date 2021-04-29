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