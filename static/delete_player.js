function delete_player(dataJson) {
  let removedID = dataJson['id'];    

  // creating copy of players list
  let players_copy = {};
  let bullets_copy = {};

  // looping through players
  Object.keys(players).forEach(id => {

    let p = players[id];
    let b_list = bullets[id];

    if (p.id === removedID) {        
      removed_name = p['name'];
      // skip over removed played
      console.log('Player ' + removed_name + ' has left the room.');      
        
    } else {
      // add active players to copy of player list        
      players_copy[p.id] = p;  
      bullets_copy[p.id] = b_list;  
    }

    // update players list
    players = players_copy;

  });
}