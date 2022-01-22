<template>
  
  <router-link 
    :to="`/${link}`" 
    :class="highlight ? 'highlight' : 'nav-button'"
  >
    {{text}}
  </router-link>

</template>

<script>
export default {
  props: {
    text: String,
    link: String,
    highlight: {
      value: false,
      type: Boolean
    }
  }
}
</script>

<style>
  #nav a:link, #nav a:visited {
  color: var(--color5);
}

#nav .nav-button {
  background-color: var(--color4);  
}

#nav .nav-button:hover {
  background-color: var(--color5);
  color: var(--color4);  
}

#nav .highlight {
  font-weight: bold;
  background-color: coral;
}

#nav .highlight:hover {
  background-color: var(--color5);
  color: coral;
}
</style>