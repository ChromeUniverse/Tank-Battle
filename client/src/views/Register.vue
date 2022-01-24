<template>
  <div class="view" id="register">

    <h1 class="title">New here?</h1>

    <p class="subtitle">Give us your sweet, sweet personal data</p>

    <p class='alert-msg' id="alert-msg" v-if="alert">{{alert_msg}}</p>

    <div class="form-input">
      <form id="login-form">

        <div class="line">
          <label for="email">Email</label>         
          <input 
            type="email" 
            v-model="email"
            id="form-email"
          />
        </div>

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

        <div class="line">
          <label for="password2">Password, but like, again</label> 
          <input 
            type="password"
            v-model="password2"   
            id="form-password-check"
          />
        </div>

        <!-- <div class="link1">
          <router-link to="/recover">Forgot your password?</router-link>      
        </div> -->

        <div class="link2">
          <span>Already got an account?</span>
          <router-link to="/login">
            <b>Log in!</b>
          </router-link>      
        </div>      
                      
      </form>

      <div>
        <button @click="signup()">Register</button>
      </div>

    </div>

  </div>
</template>

<script>
export default {
  name: 'Register',
  data(){
    return {
      email: '',
      username: '',
      password: '',
      password2: '',
      alert: false,
      alert_msg: "",
    }
  }, 
}
</script>

<style>

</style>