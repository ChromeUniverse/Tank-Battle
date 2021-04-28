# Tank Battle!

A (soon to be real-time multiplayer) tank combat game made with [p5.js](https://p5js.org/).

This project was made solely for educational purposes.

## Gallery

![image](https://media.discordapp.net/attachments/760252264723644426/837088289374732378/unknown.png?width=1271&height=632)


## At a glimpse

_Coming soon_

## Usage

_Coming soon_

## Progress

* Tank-like control scheme and movements
  * W -> forward
  * A -> CCW rotation
  * S -> backward 
  * D -> CW rotation
* Turret folows mouse
* Bullets!
  * Can bounce off of walls and hit players
  * Explode after hitting a player or after bouncing a set number of times
* Weapon cooldown and reload system
* Added bars showing number of remaining bullets, weapon cooldown time and reload time
* Obstacles
* Added collision detection and reaction
  * Player X Player, Player X Obstacle -> pulls player back to last non-colliding position
  * Player X Bullet -> eliminates player and bullet
  * Bullet X Bullet -> eliminates both bullets
  * Bullet x Obstacle, Bullet x canvas border -> reflect bullet's velocity vector about the surface normal
* Made a simple map with obstacles
* Explosion animations!
  * Appear on Player x Bullet, Bullet x Bullet collisions and after bullets have bounced on surfaces a set number of times

## Todo
* Add websockets and multiplayer features
