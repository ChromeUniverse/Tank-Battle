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

        let elo_p = document.createElement('p');
        elo_p.innerText = 'Elo rating: ';
        DOM_elo.appendChild(elo_p);

        let elo_block = document.createElement('div');
        elo_block.className = 'elo-block';
        elo_block.innerText = user_elo;
        DOM_elo.appendChild(elo_block);
    
        // display leaderboard ranking
        const DOM_lb_rank = document.getElementById("lb-rank");

        let lb_p = document.createElement('p');
        lb_p.innerText = 'Leaderboard rank: ';
        DOM_lb_rank.appendChild(lb_p);

        let lb_block = document.createElement('div');
        lb_block.className = 'lb-block';
        lb_block.innerText = user_lb_rank;
        DOM_lb_rank.appendChild(lb_block);

        
        // DOM_lb_rank.innerText = "Leaderboard ranking: " + user_lb_rank;

        // display tank color
        const DOM_tank_color = document.getElementById("tank-color");
        // DOM_tank_color.innerText = 'Tank color: ' + user_tank_color;

        let color_p = document.createElement('p');
        color_p.innerText = 'Tank color: ';
        DOM_tank_color.appendChild(color_p);


        let color_block = document.createElement('div');
        color_block.className = 'color-block';
        color_block.style.backgroundColor = user_tank_color.toString();

        // #abcdef
        let r = parseInt(user_tank_color.substr(1,2), 16);
        let g = parseInt(user_tank_color.substr(3,2), 16);
        let b = parseInt(user_tank_color.substr(5,2), 16);
        console.log(r,g,b);

        let color_block_text_color = '';
        
        if ( (r*0.299 + g*0.587 + b*0.114) > 186 ) text_color = '#000000' 
        else text_color = '#ffffff';

        color_block.style.color = text_color;

        color_block.innerText = user_tank_color;
        DOM_tank_color.appendChild(color_block);

    } else {

        console.log('error is true');

        // display error message
        const msg = document.getElementById("alert-msg");
        msg.innerText = 'User not found.'
    }

    

}

user_api_main();
