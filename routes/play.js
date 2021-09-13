// Package imports
const express = require('express');
const { private } = require('../middleware/private');
const { readFile } = require('fs/promises');
const { is_alpha_num, no_whitespace, hash, generateAccessToken } = require('../misc');
const jwt = require('jsonwebtoken');

// Express Router setup
const router = express.Router();
router.use(private);

// fs
const path_to_htmls = '/home/lucca/Documents/Programming/tank_battle/private/html/';

router.get('/*', async (req, res) => {

  let endpoint = req.url.substr(1);
  console.log("Got Play request here:", endpoint);

  if (!is_alpha_num(endpoint)) {return res.sendStatus(400)}

  const accessToken = jwt.decode(req.cookies.token);

  // replacing USERNAME, COLOR, ROOM with actual player name and random color
  res.status(200);
  // res.redirect(301, 'http://yourotherdomain.com' + req.path)
  let data = await readFile(path_to_htmls + 'room.html');
  res.send(
      data.toString()
          .replace('$USERNAME', accessToken.username)
          .replace('$COLOR', accessToken.tankColor)
          .replace('$ROOMNAME', endpoint)
  );
  return;
});

module.exports = router;