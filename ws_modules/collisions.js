const { clamp } = require("../misc");
const { hit_radius } = require('./constants');

// player x obstacle collision
function p_o_collide(p, o) {

  // clamp player X, Y coord to obstacle borders
  const x = clamp(p.x, o.left(), o.right());
  const y = clamp(p.y, o.top(), o.bottom());
  
  // distance from player to nearest point on obstacle
  const deltaX = p.x - x;
  const deltaY = p.y - y;
  const dist = Math.hypot(deltaX, deltaY);

  // if colliding, return normal vector
  if (dist < hit_radius) {

    const normalX = deltaX / dist * (hit_radius-dist);
    const normalY = deltaY / dist * (hit_radius-dist);
    return { x: normalX, y: normalY };

  } else {
    return false;
  }
}

module.exports = {
  p_o_collide
}