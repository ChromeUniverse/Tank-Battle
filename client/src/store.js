import { createStore } from 'vuex'

// initialize Vuex Store
const store = createStore({
  state() {
    return {
      auth: false
    }
  },
  mutations: {
    setAuth(state, value) {
      state.auth = value;
    }
  }
});

export default store;
