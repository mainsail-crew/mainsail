import Vue from 'vue'
import WebSocketClient from './plugins/wsClient'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import VueResource from 'vue-resource'
import './components'
import store from './store'
import router from './plugins/router'
import vueHeadful from 'vue-headful';
import VueTouchKeyboard from "vue-touch-keyboard";
import VueApexCharts from 'vue-apexcharts' ;
import VueApng from 'vue-apng';

export const bus = new Vue();

Vue.config.productionTip = false;

Vue.use(VueResource);
Vue.use(require('vue-cookies'));
Vue.use(VueTouchKeyboard);
Vue.use(VueApexCharts);
Vue.use(VueApng);
Vue.use({
    install() {
      Vue.prototype.destroy = Vue.prototype.$destroy;
    },
  });

Vue.http.headers.common['Content-Type'] = 'application/json';
Vue.http.headers.common['Access-Control-Allow-Origin'] = '*';
Vue.http.headers.common['Accept'] = 'application/json, text/plain, */*';
Vue.http.headers.common['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, Authorization, Access-Control-Allow-Origin';
Vue.http.headers.common['Access-Control-Allow-Methods'] = 'POST, GET, PUT, OPTIONS, DELETE, OPTIONS';

Vue.component('vue-headful', vueHeadful);
Vue.component('apexchart', VueApexCharts)

Vue.$cookies.config('1y')

fetch('/config.json')
.then(res => res.json())
.then(file => {
    store.commit('socket/setData', file);

    const websocketProtocol = document.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const socketClient = new WebSocketClient(websocketProtocol + store.state.socket.hostname + ':' + store.state.socket.port + '/websocket', {
        store: store,
        reconnectEnabled: true,
        reconnectInterval: store.state.socket.reconnectInterval,
    });
    socketClient.connect();
    Vue.prototype.$socket = socketClient;

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
require('./scale/index');
require('./ressourcemonitor/index');
require('./neopixel/index');