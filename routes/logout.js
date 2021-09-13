// Package imports
const express = require('express');
const { private } = require('../middleware/private');
const { getHTML } = require('../misc');

// Express Router setup
const router = express.Router();
router.use(private);

router.get('/', async (req, res)=> {  
  res.status(200).clearCookie("token").send(await getHTML('logout.html'));         
  return;
});

module.exports = router;