function is_alpha_num(string) {
    return string.match(/^[a-z0-9]+$/i) !== null;
}

function go_to_room() {
    const room_name = document.getElementById('roomname').value;
    console.log(room_name);
    const room_link = document.getElementById('create-room-link');
    console.log(room_link);

    if (is_alpha_num(room_name)) {
        console.log('got valid room name')
        window.location.href = '/play/' + room_name;
    }
    else {
        console.log('got invalid room name')
        let alert_message = document.getElementById('alert-msg');
        alert_message.innerText = 'Invalid room name.';
    }
}

// send request to API 
// let accessToken;
async function index_api_main() {

    // fetch data from API, get JSON
    const res = await fetch("/api/user", { method: "GET" });
    if (!res.ok) {console.log('Something went wrong')};
    
    const res_data = await res.json();

    // accessToken = localStorage.getItem('accessToken');    
    // console.log('Here is token:', accessToken);

    // if ( accessToken === null ) {throw "Err: token null"; }

    const msg = document.getElementById("msg");
    // const name = JSON.parse(atob(accessToken.split('.')[1])).username;
    const name = res_data.name;
    msg.innerText = "Welcome, " + name + '!';

    const btn1 = document.getElementById("btn1");
    btn1.innerText = "Leaderboard";
    document.getElementById("link1").href="/lb";

    const btn2 = document.getElementById("btn2");
    btn2.innerText = "User Page"; 
    document.getElementById("link2").href="/user";

    const btn_list = document.getElementById("btn-list");

    const lb_btn = document.createElement('a');
    lb_btn.href = '/logout';
    lb_btn.innerHTML = '<button>Logout</button>';    

    btn_list.appendChild(lb_btn);


    // websockets server address
    const server = 'localhost';
    // const server = '192.168.1.109';
    // const server = '34.200.98.64';
    // const server = '18.229.74.58';

    const ws = new WebSocket('ws://' + server + ':2848');

    // on connection
    ws.addEventListener("open", () => {
        console.log("Connected to WS Server");  
    });

    ws.addEventListener("message", msg => {

        let dataJson = JSON.parse(msg.data);

        console.log('here is message content:', dataJson);

        let dataType = dataJson['type'];


        // set user's unique ID
        if (dataType == 'set-id'){

            const timeout = 2000;

            ws.send(JSON.stringify(
                {
                    type: 'get-rooms'
                }
            ));

            // setTimeout(() => {
            //     ws.send(JSON.stringify(
            //         {
            //             type: 'get-rooms'
            //         }
            //     ));
            // }, timeout);
            
        }

        // set user's unique ID
        if (dataType == 'rooms-list'){

            const list = dataJson.rooms_list;
            // const list = [
            //     {name: 'room1'}, 
            //     {name: 'room2'}, 
            //     {name: 'room3'}, 
            //     {name: 'room4'}, 
            //     {name: 'room5'}
            // ];

            console.log('List of rooms:', list);

            let DOM_room_list = document.createElement("div");
            DOM_room_list.setAttribute("id", 'rooms-list');
            DOM_room_list.setAttribute("class", 'rooms-list');

            const title = document.createElement("h2");
            title.innerText = 'Select a Room to join...';
            
            document.body.appendChild(title);
            document.body.appendChild(DOM_room_list);

            DOM_room_list = document.getElementById('rooms-list');
            // console.log(DOM_room_list);
            
            if (list.length > 0) {
                
                list.forEach(room => {

                    console.log('adding room', room.name, 'to list');

                    const DOM_room_entry = document.createElement("div");
                    DOM_room_entry.setAttribute("class", 'room-entry');

                    const DOM_room_name = document.createElement("p");
                    DOM_room_entry.setAttribute("class", 'room-name');
                    DOM_room_name.innerText = decodeURIComponent(room.name);
                    
                    DOM_room_entry.appendChild(DOM_room_name);

                    const join_link_btn = document.createElement("a");
                    join_link_btn.setAttribute('href', '/play/'+room.name);
                    join_link_btn.innerHTML = "<button> Join </button>";                                
                    DOM_room_entry.appendChild(join_link_btn);

                    DOM_room_list.appendChild(DOM_room_entry);

                });

            } else {

                console.log('no rooms');
                
                const DOM_msg = document.createElement("h3");
                DOM_msg.innerText = 'There aren\'t any active rooms right now.';
                DOM_room_list.appendChild(DOM_msg);

            }        
            
            console.log('add create room button');

            const msg2 = document.createElement("h2");
            msg2.innerText = '...or create your own!';
            document.body.appendChild(msg2); 

            const msg3 = document.createElement("p");
            msg3.setAttribute("class", 'alert-msg');
            msg3.setAttribute("id", 'alert-msg');
            // msg3.innerText = '...or create your own!';
            document.body.appendChild(msg3); 



            const input = document.createElement("div");
            input.setAttribute('class', 'line');
            input.innerHTML = ' \
                <label class="label" for="roomname">Room name</label> \
                <input class="input" type="text" name="roomname" id="roomname"> ';

            document.body.appendChild(input);
            

            let create_link_btn = document.createElement("a");
            // create_link_btn.setAttribute('id', 'create-room-link');
            // create_link_btn.setAttribute('href', '/play/');
            create_link_btn.innerHTML = "<button onclick=\"go_to_room()\"> Create </button>";                                
            // DOM_room_entry.appendChild(join_link_btn);

            document.body.appendChild(create_link_btn);
            
        }

    });
    
}

index_api_main();


