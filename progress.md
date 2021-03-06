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
* First functional online multiplayer
 * Spawn points
 * Implemented a functional matchmaking system

## Todo
* Add websockets and multiplayer features
  * Improve bars and fix bugs  
  * Fix spawn point bugs
  * Add obstacle containers
* Implement lag-minimizing measures
  * Client-side prediction
  * Server reconciliation
  * Entity interpolation
  * Lag compensation
