const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 8080;

app.use(express.static('static'))
app.use(bodyParser.urlencoded({ extended: true }));

// color palette
const palette = [
  "#F18F01", // Tangerine  
  "#99C24D", // Atlantis Green 
  "#0B7A75", // Surfie Green
  "#BFCDE0", // Link Water
  "#729B79", // Oxley
  "#59D2FE", // Maya Blue
  "#963484", // Violet Crayola
  "#6AB547", // Green RYB
  "#336699", // Lapis Lazuli
  "#E07A5F", // Terra Cotta
  "#3D405B", // Independence
  "#E84855", // Red Crayola
  "#D95D39", // Flame
  "#DE639A", // China Pink
];

// regex magic to remove whitespaces
function isEmpty(u,) {
  let name_empty = u.replace(/\s/g, '').length == 0;
  // let room_empty = r.replace(/\s/g, '').length == 0;

  if (name_empty) {return true}
  // else if (room_empty) {return true}
  else {return false}
}

// regex magic to match letters and numbers
function letters_digits(str) {
  return str.match("^[A-Za-z0-9]+$");
}



// "Redirecting" GET requests to '/'
app.get('/', (req, res) => {
  console('Got request!');
  res.status(200);
  res.sendFile('index.html');
})

// POST request to /
app.post('/', (req, res) => {

  // parsing form data
  let formData = req.body;
  let username = formData['username'];
  // let room = formData['room'];
  // console.log('New user', username, 'joining', room);
  console.log('New user', username, 'joining');


  // checking for whitespaces
  if (isEmpty(username)) {
    res.status(200);  
    res.sendFile(__dirname + '/static/empty.html');
    return;
  }

  // checking for letter and digits
  // if (!letters_digits(username) || !letters_digits(room)) {
    if (!letters_digits(username)) {
    res.status(200);  
    res.sendFile(__dirname + '/static/letters_digits.html');
    return;
  }


  // select random color from palette 
  let playerColor = palette[Math.floor(Math.random() * palette.length)];

  // replacing USERNAME, COLOR, ROOM with actual player name and random color
  res.status(200);
  let data = fs.readFileSync(__dirname + '/static/room.html');
  res.send(data.toString().replace('USERNAME', username).replace('COLOR', playerColor));
  return;
  

})

// Start server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
})