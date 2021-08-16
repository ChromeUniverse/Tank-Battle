async function user_api_main() {

    // fetch data from API, get JSON
    const res = await fetch("/api/user", { method: "GET" });
    if (!res.ok) {console.log('Something went wrong')};
    
    const res_data = await res.json();
    console.log(res_data);

    if (!res_data.error) {
        // decode JSON response
        const user_name = res_data['name'];
        const user_elo = res_data['elo'];
        const user_lb_rank = res_data['lb_rank'];
        const user_tank_color = res_data['tank_color'];

        // display user name
        const msg = document.getElementById("msg");
        msg.innerText = user_name + "'s stats";

        // display elo ranking
        const DOM_elo = document.getElementById("elo");
        DOM_elo.innerText = 'Elo rating: ' + user_elo;

        // display leaderboard ranking
        const DOM_lb_rank = document.getElementById("lb-rank");
        DOM_lb_rank.innerText = "Leaderboard ranking: " + user_lb_rank;

        // display tank color
        const DOM_tank_color = document.getElementById("tank-color");
        DOM_tank_color.innerText = 'Tank color: ' + user_tank_color;

    } else {

        console.log('error is true');

        // display error message
        const msg = document.getElementById("alert-msg");
        msg.innerText = 'User not found.'
    }

    

}

user_api_main();
