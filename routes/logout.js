// Package imports
const express = require('express');
const { private } = require('../middleware/private');
const { readFile } = require('fs/promises');

// Express Router setup
const router = express.Router();
router.use(private);

// fs
const path_to_htmls = '/home/lucca/Documents/Programming/tank_battle/private/html/';

router.get('/', async (req, res)=> {  
  const file = await readFile(path_to_htmls + 'logout.html', 'UTF-8');
  res.status(200).clearCookie("token").send(file.toString());         
  return;
});

module.exports = router;