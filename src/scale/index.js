import store from '../store/index'

const axios = require('axios');

var raw1 = 0;
var raw2 = 0;

setInterval(retrieveData,1000);
function retrieveData(){
    axios.get("http://127.0.0.1:8081/get.json")
    .then(function (response){
        var data = response.data;
        raw1=data[0].value
        raw2=data[1].value
        store.dispatch('gui/setData', { dashboard: { boolScaleAvailable: true } });
        store.state.gui.scale.raw1=raw1
        store.state.gui.scale.raw2=raw2
    })
    .catch(function (){
        store.dispatch('gui/setData', { dashboard: { boolScaleAvailable: false } });
        if(store.state.gui.dashboard.boolScale!=false){
            store.dispatch('gui/setSettings', { dashboard: { boolScale: false } });
        }
    });
}