// miscellaneous functions

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { readFile } = require('fs/promises');

// checks if string contains only alphanumeric characters
function is_alpha_num(string) {
  return (string.match(/^[a-z0-9]+$/i) !== null);
}

// checks if string doesn't contain any whitespace characters
function no_whitespace(string) {
  return string.match(/^[^\s]+$/) !== null
}

// generate a long string of random hex chars
function generateID() {
  return Math.floor((1 + Math.random()) * 0x10000000000000).toString(16).substring(1)
}

// clamp number between two values
function clamp(num, min, max) { return Math.min(Math.max(num, min), max); }

// reflect angle about x axis
function reflect_x(angle) { return -angle; }

// reflect angle about y axis
function reflect_y(angle) { return Math.PI - angle; }


// Fisher-Yates shufflling algorithm - JS implementation courtesy of Mike Bostock
// https://bost.ocks.org/mike/shuffle/

function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

// asynchronous bcrypt hashing function
async function hash(input) {
  let salt = await bcrypt.genSalt(12);
  let hash = await bcrypt.hash(input, salt);
  console.log('Hashed', input, 'to', hash, '\n');
  return hash;
}

// generate JWT access token
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
}

// asynchronously fetch HTML file from "/private/" folder
async function getHTML(name){
  const path_to_htmls = '/home/lucca/Coding/Projects/tank_battle/server/private/html/'
  const file = await readFile(path_to_htmls + name, 'UTF-8');
  return file.toString();
}

module.exports = { 
  is_alpha_num, 
  no_whitespace, 
  hash, 
  generateAccessToken, 
  getHTML,
  generateID,
  clamp,
  reflect_x,
  reflect_y,
  shuffle,
}