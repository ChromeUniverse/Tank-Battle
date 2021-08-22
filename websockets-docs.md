# _Tank Battle!_ Websockets Server Docs

This is the main reference guide for _Tank Battle!_'s websockets server code.

## Table of Contents

_WIP_

* [Containers](#containers)
  * [Rooms and Players](#rooms-and-players)
  * [Sockets](#sockets)
  * [Room Status](#room-status)
  * [Bullets](#bullets)
  * [Obstacles](#obstacles)
  * [Spectators](#spectators)
* [Websockets message exchange model](#websockets-message-exchange-model)
* [Collision functions](#collision-functions)


## Containers

_WIP_

In the context of _Tank Battle's_ websockets server, **containers** are JS objects that store information about a wide range of important things within the game. 

Think of containers as a very simplfied version of an [in-memory](https://en.wikipedia.org/wiki/In-memory_database) [key-value database](https://en.wikipedia.org/wiki/Key%E2%80%93value_database), similar to [Redis](https://redis.io/).

There are 6 main containers in _Tank Battle!_:

```js
let rooms = {};         // rooms, room state and player data
let sockets = {};       // websockets
let rooms_status = {};  // rooms metadata
let bullets = {};       // rooms and bullets
let obstacles = {};     // rooms and obstacles
let spectators = {};    // rooms and spectators
```

### Rooms and Players

_WIP_

Stores information on all rooms and players.

An object with room names as keys and _room objects_ as values.

```js

rooms = {
  'room1': {roomObject1},
  'room2': {roomObject2},
  'room3': {roomObject3},
  ...
}

```

#### Room objects

Stores information on all players in a given room.

An object with player IDs as keys and _player entry objects_ as values

```js
roomObject1 = {
  'f6759586f1a3': {player1_entry},
  '5b6fd779e7ee': {player2_entry},
  '372dd9b624af': {player3_entry},
  ...
}
```

#### Player entry objects

Stores data related a specific player.

```js
player1_entry = {
  id: 'f6759586f1a3',         // string     player ID
  name: 'Lucca',              // string     player name
  color: '#F18F01',           // string     player color in hex
  hit: false,                 // boolean    player alive or dead
  spawn: [ 350, 350 ],        // array      two numbers
  x: 205,                     // int        current player X coordinate
  y: 576,                     // int        current player Y coordinate
  angle: 1.0303768265243125,  // float      current angle of player's tank with respect to map (radians)
  aim: 0.8960553845713439,    // float      current angle of player's turrent with respect to map (radians)
  room: 'room1',              // string     name of room in which player is currently in
  shots: [],                  // array      ?
  reloading : true,           // boolean    player is reloading or not
  cooldown : false            // boolean    player is experiencing weapon cooldown or not
}
```

### Sockets

_WIP_

Stores information about currently open websockets.

An object with player IDs as keys and [WebSocket](https://github.com/websockets/ws/blob/master/doc/ws.md#class-websocket)s as values.


```js
sockets = {
  'f6759586f1a3': ws1,
  '5b6fd779e7ee': ws2,
  '372dd9b624af': ws3,
  ...
}
```

### Room Status

_WIP_

Stores metadata about rooms.

An object with room names as keys and _room status objects_ as values.

```js
rooms_status = {
  'room1': {roomStatusObject1},
  'room2': {roomStatusObject2},
  'room3': {roomStatusObject3},
  ...
}
```

#### Room status objects

```js
roomStatusObject1 = {
  create_time: Date.now(),      // int      Date timestamp
  last_login_time: Date.now(),  // int      Date timestamp
  num_players: 1,               // int      number of players currently in room
  match_running: false,         // boolean  if match running, true, else, false
  match_start_time: -1,         // int      -1 if match hasn't stared, else, timestamp
  match_over: false,            // boolean  if match has already finished, true, else, false
  match_finish_time: -1,        // int      -1 if match hasn't stared, else, timestamp
};   
```

### Bullets

_Todo_

### Obstacles

_Todo_

### Spectators

_Todo_

_This feature is so bleeding edge that hasn't even been implemented yet!!!_

<!-- 

let sockets = {};       // websockets
let rooms = {};         // rooms, room state and player data
let rooms_status = {};  // rooms metadata
let bullets = {};       // rooms and bullets
let obstacles = {};     // rooms and obstacles
let spectators = {};    // rooms and spectators

-->









## Websockets message exchange model

### Client -> Server

_Todo_

### Server -> Client

_Todo_

## Collision functions

_Todo_