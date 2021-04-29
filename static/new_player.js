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

  // create new player and add it to players list
  // (but only if it's not the user)
  if (newPlayer_ID != user.id) {
    newPlayer = new Player(newPlayer_ID, newPlayer_name, newPlayer_color, newPlayer_X, newPlayer_Y);      
    players[newPlayer_ID] = newPlayer;

    console.log('Player ' + newPlayer_name + ' has left the room. ');

  }    

}