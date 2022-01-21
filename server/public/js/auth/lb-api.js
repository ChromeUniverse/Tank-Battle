function add_entry(lb_entry, player_name) {
  const lb_list = document.getElementById('lb-list');

  let new_lb_entry = document.createElement('div');

  if (lb_entry.username === player_name) {
    new_lb_entry.setAttribute('class', 'lb-line-user');
  } else {
    new_lb_entry.setAttribute('class', 'lb-line');
  }

  const name = document.createElement('p');
  name.setAttribute('class', 'name');
  name.innerText = lb_entry.username;
  new_lb_entry.appendChild(name);

  const elo = document.createElement('p');
  elo.setAttribute('class', 'elo');
  elo.innerText = lb_entry.elo;
  new_lb_entry.appendChild(elo);

  const rank = document.createElement('p');
  rank.setAttribute('class', 'rank');
  rank.innerText = lb_entry.lb_rank;
  new_lb_entry.appendChild(rank);

  lb_list.appendChild(new_lb_entry);
}

async function lb_api_main() {

  // fetch data from API, get JSON
  const res = await fetch("/api/lb", { method: "GET" });
  if (!res.ok) {console.log('Something went wrong')};

  const res2 = await fetch("/api/user", { method: "GET" });

  let player_name = '';

  if (!res2.ok) {console.log('Something went wrong')}
  else {
    const user_jsondata = await res2.json();
    player_name = user_jsondata.name;
    console.log('Here is player_name:', player_name);
  };
  
  
  const res_data = await res.json();
  console.log(res_data);

  if (!res_data.error) {
    // console.log('Got data!');

    for (let i = 0; i < res_data.lb.length; i++) {
      add_entry(res_data.lb[i], player_name);      
    }

  } else {

      console.log('error is true');

      // display error message
      const msg = document.getElementById("alert-msg");
      msg.innerText = res_data.message;
  }

}

lb_api_main();
