import store from '../store/index'
try {
    var HX711 = require('hx711');

    const sensor = new HX711(21, 20);

    var raw = sensor.read();

    var status = true;
    store.dispatch('gui/setSettings', { dashboard: { boolScaleAvailable: status } });

    setInterval(function(){
        raw = sensor.read();
        store.dispatch('gui/setSettings', { scale: { raw } });
    },1000);
} catch (err){
    console.log("HX711 is not installed, disable scale Feature!");
    status = false;
    store.dispatch('gui/setSettings', { dashboard: { boolScaleAvailable: status } });
    store.dispatch('gui/setSettings', { dashboard: { boolScale: status } });
 }