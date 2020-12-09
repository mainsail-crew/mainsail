import store from '../store/index'
try {
    var HX711 = require('hx711');

    const sensor1 = new HX711(21, 20);
    const sensor2 = new HX711(26, 19);

    var raw1 = sensor1.read();
    var raw2 = sensor1.read();

    var status = true;
    store.dispatch('gui/setSettings', { dashboard: { boolScaleAvailable: status } });

    setInterval(function(){
        raw1 = sensor1.read();
        raw2 = sensor2.read();
        store.dispatch('gui/setSettings', { scale: { raw1 } });
        store.dispatch('gui/setSettings', { scale: { raw2 } });
    },1000);
} catch (err){
    console.log("HX711 is not installed, disable scale Feature!");
    status = true;
    store.dispatch('gui/setSettings', { dashboard: { boolScaleAvailable: status } });
    store.dispatch('gui/setSettings', { dashboard: { boolScale: status } });
 }