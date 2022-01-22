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
  --color4: #1282a2;
  --color5: #fefcfb;
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

</style>
