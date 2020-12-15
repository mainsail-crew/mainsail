import store from '../store/index'

const axios = require('axios');

setInterval(retrieveData,1000);
function retrieveData(){
    var URL = store.state.gui.modules.neopixelcenterUrl;
    if(!URL.startsWith("https://")&&!URL.startsWith("http://")){
        return;
    }
    axios.get(store.state.gui.modules.neopixelcenterUrl)
    .then(function (){
        store.dispatch('gui/setData', { dashboard: { boolNeopixelCenterAvailable: true } });
    })
    .catch(function (){
        store.dispatch('gui/setData', { dashboard: { boolNeopixelCenterAvailable: false } });
    });
}