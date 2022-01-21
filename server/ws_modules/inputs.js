const { get_inputs, get_rooms } = require("./ws_utils");
const { run_physics } = require('./physics');
const { clamp } = require("../misc");
const { player_speed, rotation_speed, canvasW, canvasH, hit_radius } = require('./constants');
const { shoot } = require("./shoot");

// add input object to input queue
function add_input_to_queue(ws, dataJson) {

  let inputs = get_inputs();

  // console.log(dataJson);

  const input = {
    p: ws,
    keys: dataJson.keys,
    aim: dataJson.aim,
    timestamp: Date.now(),
  };

  inputs.push(input);

}


// add input object to input queue
function processInputs() {

  let inputs = get_inputs();

  // looping over inputs
  while (inputs.length > 0) {

    // pop first input object from 'inputs'
    const input = inputs.shift();

    // get keystrokes and p
    const keys = input.keys;
    const aim = input.aim;
    const p = input.p;
    const room_state = get_rooms()[p.room].meta.state;


    // apply inputs
    if (!p.hit && room_state == 'playing') {
      
      if (keys.includes('w')) {
        p.x += player_speed * Math.cos(p.heading);
        p.y += player_speed * Math.sin(p.heading);
      }
      if (keys.includes('a')) {
        p.heading -= rotation_speed;
      }
      if (keys.includes('s')) {
        p.x -= player_speed * Math.cos(p.heading);
        p.y -= player_speed * Math.sin(p.heading);
      }
      if (keys.includes('d')) {
        p.heading += rotation_speed;
      }
      if (keys.includes('z')) { 
        p.aim = aim;
        shoot(p, aim); 
      }

      // clamp player X, Y coords to map borders

      p.x = clamp(p.x, hit_radius, canvasW - hit_radius);
      p.y = clamp(p.y, hit_radius, canvasH - hit_radius);

      // console.log(inputs.length, 'inputs remain');
    }

  }

  // clear input queue
  inputs = [];
}

module.exports = { add_input_to_queue, processInputs };