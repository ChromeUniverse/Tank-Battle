const { get_rooms } = require("./ws_utils");
const { hit_radius, bullet_diam } = require("./constants");

// create new bullet 
function shoot(player, aim) {

  // get room object
  let rooms = get_rooms();
  let room = rooms[player.room];

  // new bullet object
  let new_bullet = {
    x: player.x + (hit_radius + bullet_diam/2) * Math.cos(aim),
    y: player.y + (hit_radius + bullet_diam/2) * Math.sin(aim),
    name: player.name,
    color: player.color,
    heading: aim
  } 

  console.log('New bullet headed to:', aim);

  // push new bullet to list
  room.bullets.push(new_bullet);

}

module.exports = { shoot }