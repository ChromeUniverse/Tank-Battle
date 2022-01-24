<template> 
  <Nav/>
  <router-view/>
  <Footer/>
</template>


<script>

import Nav from '@/components/Nav.vue'
import Footer from '@/components/Footer.vue'

export default {
  components: {
    Nav, Footer
  }, 
  data(){
    return {
      auth_ok: false
    }
  },
  methods: {
    async auth_test(){
      console.log('Running auth test...');      
      const res = await fetch('/api/user');
      return (res.status == 200 ? true : false);
    }
  },
  async created() {
    const auth_ok = await this.auth_test();
    console.log('Auth test is...', auth_ok);
    this.auth_ok = auth_ok; 
    this.$store.commit('setAuth', auth_ok);
    this.emitter.emit('login');
  }
}
</script>


<style>

@import url('https://fonts.googleapis.com/css2?family=Recursive:wght@400;700&family=Roboto:ital,wght@0,400;0,700;1,700&display=swap');


/* 

  Color palletes:
  https://coolors.co/32292f-575366-6e7dab-5762d5-d1e3dd
  https://coolors.co/0a1128-001f54-034078-1282a2-fefcfb

*/


:root {
  --color1: #0a1128;
  --color2: #001f54;
  --color3: #034078;
  --color4: #17a2c9;
  --color5: #fefcfb;
  --color6: rgb(93, 93, 199);
  --color7: rgb(46, 63, 105);
}

body {
  margin: 0px;
  background-color: var(--color2);
}

#app {
  font-family: 'Roboto', 'Recurssive', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  /* background-color: violet; */
}

h1 {
  font-size: 2.1em;
}

p {
  font-size: 1em; 
}

h1, h2, h3, h4, h5 {
  font-family: 'Recursive';
  color: var(--color5);
  margin: 10px;
}

p {
  font-family: 'Roboto';
  color: var(--color5);
  margin: 10px;
}

.view {
  padding-top: 60px;
  padding-bottom: 30px;
}

a.link {
  font-family: 'Recursive';
  font-weight: bold;
  text-decoration: none;
  margin-top: 30px;
}

a.link:link, a.link:visited {
  color: var(--color4);
}

a.link:hover {
  color: var(--color5);
  text-decoration: underline;
  text-decoration-color: var(--color4);
  text-decoration-thickness: 2px;
}



</style>
