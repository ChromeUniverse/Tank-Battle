const { get_rooms } = require("./ws_utils");
const { hit_radius, bullet_diam, max_shots, bullet_interval, reload_interval } = require("./constants");
const { generateID } = require("../misc");
const { send_player_explode, send_bullet_explode } = require("./messages");

// create new bullet 
function shoot(player, aim) {

  // get room object
  let rooms = get_rooms();
  let room = rooms[player.room];

  if (!player.hit) {

    if (player.shots < max_shots) {
      if (Date.now() - player.last_shot_time > bullet_interval) {

        // new bullet object
        let new_bullet = {
          id: generateID(),
          x: player.x + (hit_radius + bullet_diam / 2 + 1) * Math.cos(aim),
          y: player.y + (hit_radius + bullet_diam / 2 + 1) * Math.sin(aim),
          bounces: 0,
          room: player.room,
          name: player.name,
          color: player.color,
          heading: aim
        }

        // push new bullet to list
        room.bullets.push(new_bullet);

        // change player properties
        player.shots += 1;
        player.last_shot_time = Date.now();

        // send bullet-explode 
        send_bullet_explode(player.room, new_bullet.x, new_bullet.y)

      }

    } else {
      if (Date.now() - player.last_shot_time > reload_interval ) {
        player.shots = 0;
        shoot(player, aim);
      }
    }
  }
}

module.exports = { shoot }