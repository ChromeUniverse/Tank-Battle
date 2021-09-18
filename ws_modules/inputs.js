const { get_inputs } = require("./ws_utils");

// add input object to input queue
function add_input_to_queue(ws, dataJson) {

  let inputs = get_inputs();

  console.log(dataJson);
  console.log(dataJson.keystrokes);

  const input = {
    player: ws,
    keys: dataJson.keys,
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
    
    // get keystrokes and player
    const keys = input.keys;
    const player = input.player;

    // apply input
    if (keys.includes('w')) player.y -= 1
    if (keys.includes('a')) player.x -= 1
    if (keys.includes('s')) player.y += 1
    if (keys.includes('d')) player.x += 1
    if (keys.includes('z')) console.log('bang!')

    console.log(inputs.length, 'inputs remain');

    // run all physical interactions
    // run_physics();
  }
  
  // clear input queue
  inputs = [];
}

module.exports = { add_input_to_queue, processInputs };