<template>
  <div class="view" id="about">
    <h1>About Page</h1>
    <br>
    <div class="intro">
      <p><b>Tank Battle</b> is a real-time online multiplayer tank combat game. It's inspired by <a class="link" href="https://tankroyale.io">TankRoyale.io</a> and <a class="link" href="https://nintendo.fandom.com/wiki/Tanks!">Wii Tanks</a>.</p>
      <p>The game is being actively developed by <b>Lucca Rodrigues</b>, a junior web developer from Brasília 🇧🇷 </p>
    </div>    
    <br>
    <hr>
    <br>

    <div class="tech">
      <h2>Tech Stack</h2>

      <p>Technologies, frameworks and libraries currently being used to build <b>Tank Battle</b></p>

      <p>Frontend: <a class="link" href="https://v3.vuejs.org/">Vue.js 3</a> + <a class="link" href="https://next.vuex.vuejs.org/">Vuex 4</a> + <a class="link" href="https://next.router.vuejs.org/">Vue Router 4</a> </p>
      <p>Graphics: <a class="link" href="https://p5js.org/">p5.js</a></p>
      <p>Web server backend: <a class="link" href="https://nodejs.org/en/">Node.js</a> + <a class="link" href="https://expressjs.com/">Express.js</a></p>
      <p>Game server backend: <a class="link" href="https://nodejs.org/en/">Node.js</a> + <a class="link" href="https://www.npmjs.com/package/ws">ws</a> </p>
      
    </div>    
    <br>
    <hr>
    <br>

    <div class="thanks">
      <h2>Special thanks to...</h2>     
      <br>

      <h3>Gabriel Gambetta</h3>
      <p>For his series of amazing articles on multiplayer game design, <a class="link" href="https://www.gabrielgambetta.com/client-server-game-architecture.html">Fast-Paced Multiplayer</a>.</p>
      <br>
      <h3>Eduardo Quirino</h3>
      <p>For his open-source work on <a class="link" href="https://github.com/qrno/websockets-chat">WebSockets Chat</a> and <a class="link" href="https://github.com/qrno/django-websockets">WebSockets/Django Lounge</a>.</p>
      <br>
      <h3>João Pedro, Heitor and Wilson</h3>
      <p>For playing and beta testing the game.</p>
      
    </div>

    <br>
    <hr>
    <br>

    <div class="creator">
      <h2>Meet the Creator</h2>
      <img src="http://34.200.98.64/images/bass.jpg" alt="">
      <p> <b>Hi, I'm Lucca!</b> I'm a Brazilian self-taught technologist, programmer and musician.</p>
    </div>

  </div>
</template>

<script>
export default {
  name:'About',
}
</script>

<style>

#about {
  width: 80%;
  margin: auto;
}

#about img {
  width: 40%;
  border-radius: 12px;
}

</style>