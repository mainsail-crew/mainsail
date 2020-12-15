import store from '../store/index'

const axios = require('axios');

var URL = store.state.gui.modules.neopixelcenterUrl;

var numbleds = store.state.gui.neopixelcenter.numbleds;


if(URL.startsWith("https://")||URL.startsWith("http://")){
    axios.get(URL+"/updateLeds?amount="+numbleds)
    .then(function (){
        
    })
    .catch(function (){
        
    });
}

var ledmaxid = store.state.gui.neopixelcenter.numbleds;
ledmaxid=ledmaxid - 1;
var ledcolor = hexAToRGBA(store.state.gui.neopixelcenter.color);
if(URL.startsWith("https://")||URL.startsWith("http://")){
    axios.get(URL+"/changeLedInRange?from=0&to="+ledmaxid+"&red="+ledcolor[0]+"&green="+ledcolor[1]+"&blue="+ledcolor[2]+"&brightness="+ledcolor[3]+"")
    .then(function (){
        
    })
    .catch(function (){
        
    });
}

setInterval(retrieveData,1000);

function hexAToRGBA(h) {
    let r = 0, g = 0, b = 0, a = 1;

    if (h.length == 5) {
        r = "0x" + h[1] + h[1];
        g = "0x" + h[2] + h[2];
        b = "0x" + h[3] + h[3];
        a = "0x" + h[4] + h[4];

    } else if (h.length == 9) {
        r = "0x" + h[1] + h[2];
        g = "0x" + h[3] + h[4];
        b = "0x" + h[5] + h[6];
        a = "0x" + h[7] + h[8];
    }
    a = +(a / 255)
    a = a*100
    a = a.toFixed(0);
    var ledcolor = [+r,+g,+b,+a]

    return ledcolor;
}

function retrieveData(){
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