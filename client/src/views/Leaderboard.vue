<template>



</template>

<script>
export default {
  name: 'Leaderboard',

  data(){
    return {

    }
  },

  async created() {
    const res = await fetch('http://localhost:4000/api/lb');
    const data = res.json();
    console.log(data);
  }

}
</script>

<style>

</style>