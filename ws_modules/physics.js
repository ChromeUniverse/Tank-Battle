const { get_rooms } = require("./ws_utils");
const { p_o_collide, b_o_collide, p_b_collide, b_b_collide, p_p_collide } = require('./collisions');
const { bullet_speed, bullet_diam, canvasW, canvasH, maxBounces } = require("./constants");
const { clamp, reflect_x, reflect_y } = require("../misc");
const { send_bullet_explode, send_player_explode } = require("./messages");

function player_obstacle_collisions() {
  let rooms = get_rooms();

  for (let room of Object.values(rooms)) {
    let players = room.players;
    let boxes = room.map;

    for (let p of Object.values(players)) {            
      for (let box of boxes) {
        
        const collision = p_o_collide(p, box);

        if (collision !== false) {
          p.x += collision.x;
          p.y += collision.y;
        }

      }
    }


  }
  
}

function bullet_obstacle_collisions() {
  let rooms = get_rooms();

  for (let room of Object.values(rooms)) {
    let bullets = room.bullets;
    let boxes = room.map;

    for (let bullet of bullets) {            
      for (let box of boxes) {
        
        const collision = b_o_collide(bullet, box);

        if (collision != false) {

          bullet.bounces += 1;

          // console.log('\nCollision!', 'NormalX:', collision.x, 'NormalYs:', collision.y, '\n');

          bullet.x += collision.x;
          bullet.y += collision.y;

          if (collision.x != 0 && collision.y == 0) { bullet.heading = reflect_y(bullet.heading) } 

          if (collision.x == 0 && collision.y != 0) { bullet.heading = reflect_x(bullet.heading) }
        }

      }
    }


  }
}

function player_bullet_collisions() {
  let rooms = get_rooms();

  for (let room of Object.values(rooms)) {

    let players = room.players;
    let bullets = room.bullets;

    for (const player of Object.values(players)) {
      for (const bullet of bullets) {
        const collision = p_b_collide(player, bullet);
        if (collision) {
          player.hit = true;
          room.bullets = bullets.filter(b => b.id != bullet.id);
          send_player_explode(player.room, player.x, player.y);
        } 
      }
    }

  }
}

function bullet_bullet_collisions() {
  let rooms = get_rooms();

  for (let room of Object.values(rooms)) {

    let bullets = room.bullets;

    for (const b1 of bullets) {
      for (const b2 of bullets) {
        const collision = b_b_collide(b1, b2);
        if (collision) {
          room.bullets = bullets.filter(b => (b.id != b2.id) && (b.id != b1.id) );
          send_bullet_explode(b2.room, b2.x, b2.y);
          send_bullet_explode(b1.room, b1.x, b1.y);
        }
        
      }
    }
  }
}


function player_player_collisions() {
  let rooms = get_rooms();

  for (let room of Object.values(rooms)) {

    let players = room.players;

    for (const p1 of Object.values(players)) {
      for (const p2 of Object.values(players)) {
        const collision = p_p_collide(p1, p2);
        if (collision != false) {
          p1.x += collision.x;
          p2.y += collision.y;                
        }        
      }
    }
  }
}


function bullet_step(){
  let rooms = get_rooms();

  for (let room of Object.values(rooms)) {
    let bullets = room.bullets;

    bullets.forEach(b => {

      b.x = b.x + bullet_speed * Math.cos(b.heading);
      b.y = b.y + bullet_speed * Math.sin(b.heading);

      if (b.x < bullet_diam / 2 || b.x > canvasW - bullet_diam / 2) {
        b.heading = reflect_y(b.heading);
        b.bounces += 1;
      }

      if (b.y < bullet_diam / 2 || b.y > canvasH - bullet_diam / 2) {
        b.heading = reflect_x(b.heading);
        b.bounces += 1;
      }

      if (b.bounces == maxBounces + 1) {
        send_bullet_explode(b.room, b.x, b.y);
      }

    });

    // bullets = bullets.filter(b => {b.bounces <= maxBounces && (b.x != NaN) && (b.y != NaN)});
    bullets = bullets.filter(b => b.bounces <= maxBounces);
    room.bullets = bullets;

  }

}

function collisions(){
  player_obstacle_collisions();
  bullet_obstacle_collisions();
  player_bullet_collisions();
  bullet_bullet_collisions();
  // player_player_collisions();
}


function run_physics(){
  collisions();
  bullet_step()
}


module.exports = { run_physics };