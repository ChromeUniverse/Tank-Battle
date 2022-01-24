<template>

  <div class="view" id="home">
    <h1 class="title">
      <span><i>Tank Battle!</i></span>
    </h1>
    <h1>Epic Battles, Real-Time Multiplayer Combat</h1>
    <br>
    <img src="/tank-battle-img.png" alt="">

  </div>
  
</template>

<script>
export default {
  name: 'Home',
  data(){
    return {

    }
  },
  created(){
    console.log(this.$store.state.auth);
  }

}
</script>

<style>

#home {
  color: var(--color5)
}

#home h1.title {
  font-size: 3.3em;
}

#home h1 span {
  /* text-decoration: underline; */
  /* text-decoration-thickness: 0.1em; */
}

#home img{
  width: 60%;
  border-radius: 12px;
}

</style>