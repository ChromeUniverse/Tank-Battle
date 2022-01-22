<template>
  <div id="nav">

    <NavButton text="Home" link=""/>

    <NavButton text="Leaderboard" link="lb"/>

    <NavButton text="Profile" link="user"/>

    <NavButton text="Login" link="login"/>

    <NavButton text="Signup" link="signup"/>

    <NavButton text="Play Now!" link="play" :highlight="true"/>

  </div>

</template>

<script>

import NavButton from '@/components/NavButton.vue'

export default {  
  name: 'Nav',
  components: {
    NavButton
  }
}


</script>

<style>

#nav {
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 10px;
  border-radius: 3px;
}

#nav a {
  font-family: 'Recursive';
  padding: 5px 10px;
  margin: 0px 5px;
  font-size: 1em;
  text-decoration: none;
  border-radius: 6px;
}

</style>