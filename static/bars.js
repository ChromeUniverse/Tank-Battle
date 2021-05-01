// function draw_cooldown_bar(p) {

//   let b_list = p.shots;

//   if (!p.reloading && b_list.length != 0) {
//     strokeWeight(2);
//     stroke(color(220));
//     rectMode(CENTER);
//     fill('#ffaa66');
//     rect(p.x, p.y-60, 70, 10);

//     let ratio = (Date.now() - b_list[b_list.length-1].time)/bullet_interval;
//     // console.log(ratio);
//     fill(color(49, 191, 6));
//     rectMode(CORNER);
//     if (ratio <= 1) {  
//       // noStroke();  
//       rect(p.x-35, p.y-65, 70*ratio, 10);  
//     } 
//     else {
//       p.cooldown = false;
//       console.log('reset cooldown');
//     }
//   }
  
// }

// function draw_shots_bar(p) {

//   let b_list = p.shots;

//   strokeWeight(2);
//   stroke(color(220));
//   rectMode(CENTER);
//   fill('#ffaa66');
//   rect(p.x, p.y-70, 70, 10);

//   let ratio;

//   if (!p.reloading && b_list.length == 0) {
//     ratio = 0;
//   } 

//   ratio = b_list.length/max_shots;

//   // console.log(ratio);
//   fill(color(5, 113, 255));
//   rectMode(CORNER);
//   if (ratio <= 1) {  
//     // noStroke();  
//     rect(p.x-35, p.y-75, 70*(1-ratio), 10);  
//   } 
//   /*
//   else {
//     p.reloading = false;
//     console.log('reset reloading');
//   }
//   */

// }

// function draw_reload_bar(p) {

//   let b_list = p.shots;

//   strokeWeight(2);
//   stroke(color(220));
//   rectMode(CENTER);
//   fill('#ffaa66');
//   rect(p.x, p.y-60, 70, 10);

//   let ratio = (Date.now() - b_list[b_list.length-1].time)/reload_interval;
//   // console.log(ratio);
//   fill('#ff0000');
//   rectMode(CORNER);
//   if (ratio <= 1) {    
//     rect(p.x-35, p.y-65, 70*ratio, 10);  
//   } 
//   else {
//     p.reloading = false;
//     console.log('reset reloading');
//   }
// }
