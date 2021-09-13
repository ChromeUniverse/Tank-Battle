// miscellaneous functions
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { readFile } = require('fs/promises');

function is_alpha_num(string) {
  return (string.match(/^[a-z0-9]+$/i) !== null);
}

function no_whitespace(string) {
  return string.match(/^[^\s]+$/) !== null
}

async function hash(input) {
  let salt = await bcrypt.genSalt(12);
  let hash = await bcrypt.hash(input, salt);
  console.log('Hashed', input, 'to', hash, '\n');
  return hash;
}

function generateAccessToken(user) {
  // return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '25s'});
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
}

async function getHTML(name){
  const path_to_htmls = '/home/lucca/Documents/Programming/tank_battle/private/html/'
  const file = await readFile(path_to_htmls + name, 'UTF-8');
  return file.toString();
}

module.exports = { is_alpha_num, no_whitespace, hash, generateAccessToken, getHTML }