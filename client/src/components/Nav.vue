<template>
  <div id="nav" class="header" v-cloak>

    <div id="left">
      <Button text="Home" link=""/>
    </div>

    <div id="center">
      <Button text="Profile" link="user" v-if="auth"/>
      <Button text="Rankings" link="lb" v-if="auth"/>
      <Button text="About" link="about"/>
      <Button text="Blog" link="http://34.200.98.64/" :external="true"/>
      <Button text="Play Now!" link="play" :highlight="true" v-if="auth"/>
    </div>

    <div id="right">      
      <Button text="Login" link="play" :highlight="true" v-if="!auth"/>
      <Button text="Logout" link="logout" v-if="auth"/>
    </div>

  </div>
</template>

<script>

import Button from '@/components/Button.vue'

export default {  
  name: 'Nav',
  components: {
    Button
  }, 
  // props: {
    // auth: Boolean
  // },

  data(){
    return {
      auth: false
    }
  },

  created(){
    this.emitter.on('login', (evt) => {
      this.auth = true;
    })
    this.emitter.on('logout', (evt) => {
      this.auth = false;
    })

  }
}


</script>

<style>

[v-cloak] {
  display: none;
}

#nav {
  display: grid;
  flex-direction: row;
  justify-content: space-between;
  padding: 15px 100px 0px 100px;
  /* margin: 30px 0px 0px 0px; */
  /* margin: auto; */
  /* border-radius: 0px 0px 12px 12px; */
  background-color: var(--color7);
  grid-template-columns: [first] 20% auto [last] 20%;
}

#left {
  text-align: left;
} 

#center {
  /* justify-self: center; */
  /* use either */
  margin: 0 auto;
  /* display: flex; */

}

#right {
  /* justify-self: end; */
  text-align: right;
}

/* #left, #right {
  flex-grow: 1;
  flex-basis: 0;
} */

.header {
  /* fixing the position takes it out of html flow - knows
  nothing about where to locate itself except by browser
  coordinates */
  position:fixed; 
  /* top left corner should start at leftmost spot */
  /* left:0;            */
  /* top left corner should start at topmost spot */
  top: 0px;            
  width:95vw;      
  left: 50%;
  transform: translate(-50%, 0);
  /* high z index so other content scrolls underneath */
  z-index:200;  
  /* define height for content */
  height: 35px;     
}


</style>