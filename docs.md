# Documentation

## In-memory Containers

### Rooms 

_WIP_



### Sockets

_Todo_

### Room Status

_WIP_

**Stores metadata about rooms.**

An object with room names as keys and room status objects as values.

#### Main Object

```js
rooms_status = {
  'room1': {roomObject1},
  'room2': {roomObject2},
  'room3': {roomObject3},
  ...
}
```

#### Room status objects

```js
roomObject1 = {
  create_time: Date.now(),      // timestamp
  last_login_time: Date.now(),  // timestamp
  num_players: 1,               // int
  match_running: false,         // boolean
  match_start_time: -1,         // -1 if match hasn't stared, else, timestamp
  match_over: false,            // boolean
  match_finish_time: -1,        // -1 if match hasn't stared, else, timestamp
};   
```

### Bullets

_Todo_

### Obstacles

_Todo_

### Spectators

_Todo_

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