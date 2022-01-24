<template>

  <div class="view" id="user-profile">
    <h1>Profile</h1>

    <p>Name: <b>{{name}}</b> </p>
    <p>Elo Rating: <b>{{elo}}</b> </p>
    <p>Leaderboard Rank: <b>{{lb_rank}}</b> </p>
    <p>Tank Color: <b>{{tank_color}}</b> </p>

  </div>
  
</template>

<script>
export default {
  name: 'UserProfile',

  data(){
    return {
      name: '',
      elo: 0,
      lb_rank: 0,
      tank_color: ''
    }
  },

  async created() {
    const res = await fetch('/api/user', { credentials: 'include' });
    const data = await res.json();
    console.log(data);
    this.name = data.name;
    this.elo = data.elo;
    this.lb_rank = data.lb_rank;
    this.tank_color = data.tank_color;
  }
}
</script>

<style>

</style>