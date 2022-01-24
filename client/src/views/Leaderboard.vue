<template>

  <div class="view" id="leaderboard">
    <h1>Leaderboard</h1>

    <div id="lb-list" class="lb-list">

      <div id="lb-list-header" class="lb-line-header">
        <p id="rank-header" class="rank">Rank</p>      
        <p id="name-header" class="name">Name</p>
        <p id="elo-header"  class="elo">Elo</p>
      </div>  

      <div 
        v-for="entry in lb" :key="entry" 
        :class="`lb-line ${(name == entry.username ? 'line-highlight' : '')}`"
      >
        <p :class="`rank ${assign_class_based_on_rank(entry)}`">
          {{entry.lb_rank}}
        </p>
        <p class="name">
          {{entry.username}}
        </p>
        <p class="elo">
          {{entry.elo}}
        </p>
      </div>  

    </div>
  </div>

</template>

<script>
export default {
  name: 'Leaderboard',

  data(){
    return {
      lb: [],
      name: '',
    }
  },

  methods: {
    assign_class_based_on_rank(entry){
      if (entry.lb_rank == 1) return 'podium first';
      if (entry.lb_rank == 2) return 'podium second';
      if (entry.lb_rank == 3) return 'podium third';
      else return '';
    }
  },

  async created() {
    // get username
    const user_res = await fetch('/api/user', { credentials: 'include' });
    const data1 = await user_res.json();
    this.name = data1.name;

    // get leaderboard data
    const lb_res = await fetch('/api/lb', { credentials: 'include' });
    const data2 = await lb_res.json();
    this.lb = data2.lb;
  }

}
</script>

<style>

.lb-list {
  width: 500px;
  display: flex;
  flex-direction: column;  
  /* background-color: #32324d; */
  padding: 10px;
  border-radius: 10px;
  margin: auto;
}

#lb-list-header {
  background-color: rgb(46, 63, 105);
  border-radius: 10px;
  
}

#name-header, #elo-header, #rank-header {
  font-size: 1em;
  /* padding: 20px; */
}

#name-header {
  text-align: left;
  /* margin-left: 50px; */
  /* padding-left: 50px; */
}

.lb-line, .lb-line-header {
  display: flex;
  flex-direction: row;
  margin-top: 5px;
  margin-bottom: 5px;
  justify-content:space-between;
}

.lb-line-header p, .lb-line p {
  font-family: 'Recursive';
}

.lb-line {
  font-size: 1.2em;
}

.lb-line-user {
  /* width: 100%; */
  display: flex;
  flex-direction: row;
  background-color: rgb(114, 114, 175);
  border-radius: 10px;
  margin-top: 5px;
  margin-bottom: 5px;
  justify-content: space-between;
}

.line-highlight {
  background-color: var(--color4);
  border-radius: 10px;
}

.podium {
  margin: 8px 10px;
  padding: 2px 0px;
  border-radius: 12px;
  text-shadow: 2px 2px 4px #000000;
}

.first {
  background-color: #ffd500;
}

.second {
  background-color: rgb(146, 146, 146);
}

.third {
  background-color: #AD8A56;
}

/* .name, .elo, .rank {
  width: 200px;
  /* padding: 5px; */
  /* background-color: grey; */
/* } */

.rank {
  /* flex: 0 0 auto; */
  width: 50px;
  /* flex: 2; */
}

.name {
  /* flex: 10 300px; */
  flex: 1 1 auto;
  /* min-width: 300px; */
  text-align: left;
}

.elo {
  width: 70px;
  /* flex: 0 0 auto; */
  /* flex: 2; */
}


</style>