/*

  Handles 'new-player' WS messages

*/


function new_player(dataJson) {

  // get new player attributes
  newPlayer_ID = dataJson['id'];
  newPlayer_name = dataJson['name'];
  newPlayer_color = dataJson['color'];
  newPlayer_X = dataJson['x'];
  newPlayer_Y = dataJson['y'];
  newPlayer_angle = dataJson['angle'];

  // create new player and add it to players list
  // (but only if it's not the user)
  if (newPlayer_ID != user.id) {
    newPlayer = new Player(
      newPlayer_ID, 
      newPlayer_name, 
      newPlayer_color, 
      false,
      newPlayer_X, 
      newPlayer_Y, 
      p5.Vector.fromAngle(newPlayer_angle, player_speed),
    );      
    players[newPlayer_ID] = newPlayer;

    console.log('Player ' + newPlayer_name + ' has joined the room! ');

  }    

}