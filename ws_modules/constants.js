
module.exports = Object.freeze({
  // canvas properties
  canvasW: 1200,
  canvasH: 600,

  // player properties
  hit_radius: 30,
  player_speed: 3,
  rotation_speed: 0.07,

  // bullet properties
  bullet_speed: 4,
  bullet_interval: 350,
  bullet_diam: 15,
  reload_interval: 2000,
  maxBounces: 3,
  max_shots: 5,

  // game match properties
  min_players: 2,
  max_players: 6,
  // in SECONDS!
  pre_match_time: 6,
  post_match_time: 6,

  spawn1: [ 100, 100 ],
  spawn2: [ 250, 550 ], 
  spawn3: [ 350, 350 ], 
  spawn4: [ 700, 450 ],
  spawn5: [ 1100, 500 ],
  spawn6: [ 900, 100 ],  
  
  // number of game updates per second
  update_rate: 50,
  time_step: 10,    // time step in milliseconds
})