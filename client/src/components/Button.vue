<template>
  
  <router-link 
    :to="`/${link}`" 
    :class="highlight ? 'highlight' : 'button'"
    v-if="!external"
  >
    {{text}}
  </router-link>

  <a 
    :href="link" 
    :class="highlight ? 'highlight' : 'button'"
    v-if="external" 
  >
    {{text}}
  </a>

</template>

<script>
export default {
  name: 'Button',
  props: {
    text: String,
    link: String,
    highlight: {
      value: false,
      type: Boolean
    },
    external: {
      value: false,
      type: Boolean
    }
  }
}
</script>

<style>

a.button, a.highlight {
  font-family: 'Recursive';
  padding: 7px 12px;
  margin: 0px 5px;
  font-size: 1em;
  text-decoration: none;
  border-radius: 6px;
}

a:link, a:visited {
  color: var(--color5);
}

a.button {
  background-color: var(--color4);  
}

a.button:hover {
  background-color: var(--color5);
  color: var(--color4);  
}

a.highlight {
  font-weight: bold;
  font-size: 1.0em;
  background-color: coral;
}

a.highlight:hover {
  background-color: var(--color5);
  color: coral;
  outline: 2px solid coral;
}
</style>