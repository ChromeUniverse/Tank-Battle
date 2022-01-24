<template>
  <div class="view" id="logout">
    <h1>Logout</h1>
  </div>
</template>

<script>
export default {
  name: 'Logout',
  async created(){

    // if (!this.$store.state.auth){
    //   console.log('Fetched store, already logged out! Redirecting...');
    //   return this.$router.push('/');
    // }

    const res = await fetch('/api/logout');
    console.log(res);
    if (res.status == 200) {
      console.log('LOGOUT!');
      this.$store.commit('setAuth', false);
      this.emitter.emit('logout');      
    }
  }
}
</script>

<style>

</style>