// Package imports
const express = require('express');
const { private } = require('../middleware/private');
const { is_alpha_num, getHTML } = require('../misc');
const jwt = require('jsonwebtoken');

// Express Router setup
const router = express.Router();
router.use(private);

router.get('/*', async (req, res) => {

  let endpoint = req.url.substr(1);
  console.log("Got Play request here:", endpoint);

  if (!is_alpha_num(endpoint)) { return res.status(400).send(await getHTML('400.html')) }

  const accessToken = jwt.decode(req.cookies.token);

  // replacing USERNAME, COLOR, ROOM with actual player name and random color
  res.status(200);
  let data = await getHTML('room.html');
  res.send(
      data.toString()
          .replace('$USERNAME', accessToken.username)
          .replace('$COLOR', accessToken.tankColor)
          .replace('$ROOMNAME', endpoint)
  );
  return;
});

module.exports = router;