<template>

  <div class="view" id="login">

    <h1 class="title">Welcome back!</h1>

    <p class="subtitle">We're excited to see you again!</p>

    <p class='alert-msg' id="alert-msg" v-if="alert">{{alert_msg}}</p>

    <div class="form-input">

      <form id="login-form">

        <div class="line">
          <label for="username">Username</label>         
          <input 
            type="text" 
            v-model="username"
            id="form-username"
          />
        </div>

        <div class="line">
          <label for="password">Password</label> 
          <input 
            type="password"
            v-model="password"   
            id="form-password"
          />
        </div>

        <div class="link1">
          <router-link to="/recover">
            <b>Forgot your password?</b>            
          </router-link>      
        </div>

        <div class="link2">
          <span>Need an account?</span>
          <router-link to="/register">            
            <b>Register!</b>
          </router-link>      
        </div>      
                      
      </form>

      <div>
        <button @click="login()">Login</button>
      </div>

    </div>

  </div>
  
</template>

<script>

export default {
  name: 'Login',
  data(){
    return {
      username: '',
      password: '',
      alert: false,
      alert_msg: "",
    }
  }, 
  methods: {
    async login(){
      console.log(this.username, this.password);

      const url = "/login";

      const payload = {
        username: this.username,
        password: this.password
      };

      const fetchOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          credentials: 'include',			
        },
        body: JSON.stringify(payload)
      };

      const res = await fetch(url, fetchOptions);
      const data = await res.json();

      console.log(res.status, data);

      // display error message
      if (data.error) {
        this.alert = true;
        this.alert_msg = data.message;
      } else {
        this.alert = false;
        this.alert_msg = "";
      }

      if (res.status == 200) {
        console.log('LOGIN DONE!');
        this.emitter.emit('login');
        this.$store.commit('setAuth', true);
        this.$router.push('/');
      }

    }
  },
}
</script>

<style>

p.subtitle {
  opacity: 50%;
}

p#alert-msg {
  opacity: 100%;
  font-weight: bold;
  padding-top: 15px;
  padding-bottom: 5px;
}

#login-form {
  color: var(--color5);
}

/* #login-form input {
  color: var(--color1)
} */

div .form-input {
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
}

div .line {
  display: flex;
  flex-direction: column;
  /* justify-content: space-between; */
  /* background-color: chartreuse; */
  /* width: 500px; */
  
  margin-top: 15px;
  margin-bottom: 15px;
  text-align: left;
}

#login-form label {
  /* width: 10px; */
  font-family: 'Recursive';
  font-size: 1.2em;
  color: var(--color5);
  opacity: 80%;
  padding-bottom: 5px;
  /* background-color: crimson; */
}

.alert-msg {
  margin: 10px;
  font-size: 20px;
  color: coral;
}

#login-form input {
  height: 35px;
  width: 300px;
  padding: 0px 10px;
  border: 0px;
  border-radius: 6px;

  font-size: 1.1em;  
  background-color: rgb(46, 63, 105);
  color: var(--color5);
}

#login-form input:focus {
  outline: 2px solid var(--color4);
}

.link1 {
  margin-top: 20px;
  margin-bottom: 5px;
}

.link2 {
  margin-top: 0px;
  margin-bottom: 10px;
}

.link2 span {
  opacity: 50%;
  margin-right: 0.4em;
}

b {
  font-family: 'Recursive';
}

#login-form a {
  font-family: 'Roboto';
  text-decoration: none;
  margin-top: 30px;
}

#login-form a:link, #login-form a:visited {
  color: var(--color4);
}

#login-form a:hover {
  color: var(--color5);
  text-decoration: underline;
  text-decoration-color: var(--color4);
  text-decoration-thickness: 2px;
}

.form-input button {
  height: 40px;
  width: 100px;
  margin: 10px;

  font-family: 'Recursive';
  font-weight: bold;
  font-size: 1em;
  background-color: var(--color4);
  border: 0px;
  border-radius: 9px;
  color: var(--color5);
}

.form-input button:hover {
  background-color: var(--color5);
  color: var(--color4);
}


</style>