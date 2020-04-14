import Vue from 'vue'
import JRPCWS from './plugins/json-rpc-websocket'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import VueResource from 'vue-resource'
import './components'
import store from './store'
import router from './plugins/router'
import 'vue-toast-notification/dist/index.css';
import vueHeadful from 'vue-headful';

Vue.config.productionTip = false;

Vue.use(VueResource);
Vue.http.headers.common['Content-Type'] = 'application/json';
Vue.http.headers.common['Access-Control-Allow-Origin'] = '*';
Vue.http.headers.common['Accept'] = 'application/json, text/plain, */*';
Vue.http.headers.common['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, Authorization, Access-Control-Allow-Origin';
Vue.http.headers.common['Access-Control-Allow-Methods'] = 'POST, GET, PUT, OPTIONS, DELETE, OPTIONS';

Vue.component('vue-headful', vueHeadful);

fetch('/config.json').then(res => res.json())
  .then(file => {
    store.commit('setSettings', file);
    Vue.use(JRPCWS, 'ws://' + store.state.socket.hostname + ':' + store.state.socket.port + '/websocket', {
      store: store,
      reconnectEnabled: true,
      reconnectInterval: store.state.socket.reconnectInterval,
      reconnectAttempts: store.state.socket.reconnectAttempts,
    });

    new Vue({
      vuetify,
      router,
      store,
      render: h => h(App)
    }).$mount('#app')
  })
  .catch((error) => {
    let p = document.createElement("p");
    let content = document.createTextNode("config.json not found or cannot be decoded!");
    p.appendChild(content);
    document.getElementById('app').append(p);
    window.console.error('Error:', error);
  });