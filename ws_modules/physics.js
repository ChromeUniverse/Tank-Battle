const { get_rooms } = require("./ws_utils");
const { p_o_collide } = require('./collisions');

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


function run_physics(){
  player_obstacle_collisions();
}



module.exports = { run_physics };