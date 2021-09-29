const { clamp } = require("../misc");
const { hit_radius, bullet_diam } = require('./constants');

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

// bullet x obstacle collision
function b_o_collide(b, o) {

  // clamp player X, Y coord to obstacle borders
  const x = clamp(b.x, o.left(), o.right());
  const y = clamp(b.y, o.top(), o.bottom());
  
  // distance from player to nearest point on obstacle
  const deltaX = b.x - x;
  const deltaY = b.y - y;
  const dist = Math.hypot(deltaX, deltaY);

  // if colliding, return normal vector
  if (dist < bullet_diam/2) {

    const normalX = deltaX / dist * (bullet_diam/2-dist);
    const normalY = deltaY / dist * (bullet_diam/2-dist);
    return { x: normalX, y: normalY };

  } else {
    return false;
  }
}

function p_b_collide(p, b) {
  const deltaX = p.x - b.x;
  const deltaY = p.y - b.y;
  const dist = Math.hypot(deltaX, deltaY);

  if (dist <= (hit_radius + bullet_diam/2) && !p.hit ) {
    console.log('\n Player', p.name, 'died!');
    console.log('\n Player coords:', p.x, p.y);
    console.log('\n Bullet coords:', b.x, b.y);
    console.log('\n Distance:', dist, '<', hit_radius + bullet_diam/2);
    return true;
  }
  else return false;
}

function b_b_collide(b1, b2) {
  const deltaX = b1.x - b2.x;
  const deltaY = b1.y - b2.y;
  const dist = Math.hypot(deltaX, deltaY);

  if (dist <= (bullet_diam) && (b1.id != b2.id) ) return true
  else return false;
}

function p_p_collide(p1, p2) {
  const deltaX = p1.x - p2.x;
  const deltaY = p1.y - p2.y;
  const dist = Math.hypot(deltaX, deltaY);

  // if colliding, return normal vector
  if (dist < hit_radius * 2 && (p1.id != p2.id)) {

    const normalX = deltaX / dist * (2*hit_radius-dist);
    const normalY = deltaY / dist * (2*hit_radius-dist);
    return { x: normalX, y: normalY };

  } else {
    return false;
  }
}

module.exports = {
  p_o_collide,
  b_o_collide,
  p_b_collide,
  b_b_collide,
  p_p_collide
}