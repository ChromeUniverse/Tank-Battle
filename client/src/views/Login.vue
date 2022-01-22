<template>

  <div id="login-form">

    <div class="input-line">
      <label for="username">Username</label>
      <input type="text" id="username" name="username">
    </div>

    <div class="input-line">
      <label for="password">Password</label>
      <input type="password" id="password" name="password">
    </div>
    
  </div>

  
</template>

<script>
export default {
  data(){
    return {
      username: '',
      password: '',
    }
  }
}
</script>

<style>

#login-form {
  font-family: 'Roboto';
}

#login-form label {
  color: var(--color5);
}

/* #login-form input {
  color: var(--color1)
} */

</style>