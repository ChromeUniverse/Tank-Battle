# _Tank Battle!_ Websockets Server Docs

This is the main reference guide for _Tank Battle!_'s websockets server code.

This is where all the game logic is handled.

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

An object with player IDs as keys and [WebSocket](https://github.com/websockets/ws/blob/master/doc/ws.md#class-websocket)s as values. When the sockets are closed, their respective entry is removed from this object.


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

Stores metadata about rooms. This information is used to determine if a given room is in a _pre-match_, _match running_ or _post-match_ state.

The metadata is stored in an object with room names as keys and _room status objects_ as values.

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

_WIP_

Stores information about all obstacles in all rooms.

An object with room names as keys and an array of _Obstacles_ as values. 

```js

obstacles = {
  'room1' = [obstacleArray1],
  'room2' = [obstacleArray2],
  'room3' = [obstacleArray3],
  ...
}

```

#### Obstacle arrays

Stores information about all obstacles in a specific room

```js
obstacleArray1 = [
  obstacle1,
  obstacle2,
  obstacle3,
  obstacle4,
  ...
]
```

#### Obstacle class

In _Tank Battle!_, Obstacles are a class that represent solid boxes over which the player cannot traverse, similarly to the map's walls. Bullets also ricochet after coming into contact with one of obstacle's edges.

The Obstacle class is pretty simple.

A new Obstacle instance can be instantiated like so:

```js
let newbox = new Obstacle(200, 200, 100, 100, '#7a7a7a');
```

Its constructor requires 5 arguments: 
  * **x** - the x coordinate of the new obstacle's top-left corner
  * **y** - the y coordinate of the new obstacle's top-left corner
  * **w** - the new obstacle's width
  * **h** - the new obstacle's height
  * **col** - the new obstacle's color (in hex)

The class also has 4 simple methods for returning the edges of an obstacle.

Full source:

```js
class Obstacle {
  constructor(x, y, w, h, col) {
    this.x = x;                       // int      top-left corner x coordinate
    this.y = y;                       // int      top-left corner y coordinate
    this.w = w;                       // int      obstacle width
    this.h = h;                       // int      obstacle height
    this.col = col;                   // string   obstacle color (hex)
  }

  // get edges
  top() {return this.y}               // returns: int   top edge y coordinate
  left() {return this.x}              // returns: int   top edge y coordinate
  bottom() {return this.y + this.h;}  // returns: int   bottom edge y coordinate
  right() {return this.x + this.w;}   // returns: int   right edge x coordinate

}
```

When a new room is created, the `createObstacles` function is called to create a new entry for a specific room in the obstacles containers and add a common set of obstacles to the room. 

```js

// Creates new Obstacle list for a given room

function createObstables(room_name) {
  obstacles[room_name] = [];
  let box = new Obstacle(200, 200, 100, 100, '#7a7a7a');
  obstacles[room_name].push(box);
  box = new Obstacle(200, 300, 100, 100, '#7a7a7a');
  obstacles[room_name].push(box);
  ...
}

```

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