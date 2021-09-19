module.exports = Object.freeze({
  // canvas properties
  canvasW: 1200,
  canvasH: 600,

  // player properties
  hit_radius: 30,
  player_speed: 3,
  rotation_speed: 0.07,

  // bullet properties
  bullet_speed: 7,
  bullet_interval: 350,
  bullet_diam: 15,
  reload_interval: 2000,
  maxBounces: 3,
  max_shots: 5,

  // game match properties
  max_players: 6,
  // in SECONDS!
  pre_match_time: 6,
  post_match_time: 6,

  // number of game updates per second
  update_rate: 50
})