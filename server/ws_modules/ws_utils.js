let rooms = {};
let inputs = [];
let players = [];

function get_inputs()   { return inputs } 

function get_players()  { return players }

function get_rooms()    { return rooms }

function set_players(array)  { players = array }

module.exports = { get_inputs, get_players, get_rooms, set_players };