import store from '../store/index'

const axios = require('axios');

var URL = store.state.gui.modules.ressourcemonitorUrl;

var now = Date.now();

setInterval(retrieveData,1000);
store.dispatch('ressourcemonitor/ramHistory/getHistory', {  });

function retrieveData(){
    var oldURL = URL;
    URL = store.state.gui.modules.ressourcemonitorUrl;
    if(!URL.startsWith("https://")&&!URL.startsWith("http://")){
        return;
    }
    if(URL!=oldURL){
        store.commit('ressourcemonitor/ramHistory/reset');
    }
    now = Date.now();
    axios.get(URL)
    .then(function (){
        store.dispatch('gui/setData', { dashboard: { boolRessourceMonitorAvailable: true } });
        retrieveCPU();
        retrieveCPUSpeed();
        retrieveCPULoad();
        retrieveCPUTemp();
        retrieveRAM();
        retrieveRAMLoad();
    })
    .catch(function (){
        store.dispatch('gui/setData', { dashboard: { boolRessourceMonitorAvailable: false } });
        return;
    });
}
function retrieveCPU(){
    axios.get(URL+"/getCPU")
    .then(function (response){
        store.state.ressourcemonitor.cpu.vendor=response.data.manufacturer
        store.state.ressourcemonitor.cpu.brand=response.data.brand
        store.state.ressourcemonitor.cpu.cores=response.data.physicalCores
        store.state.ressourcemonitor.cpu.threads=response.data.cores
        store.state.ressourcemonitor.cpu.socket=response.data.socket
        store.state.ressourcemonitor.cpu.freqmin=response.data.speedmin
        store.state.ressourcemonitor.cpu.freqmax=response.data.speedmax
    })
    .catch(function (){
        
    });
}
function retrieveCPUSpeed(){
    axios.get(URL+"/getCPUSpeed")
    .then(function (response){
        store.state.ressourcemonitor.cpu.freqcores=response.data.cores
    })
    .catch(function (){
        
    });
}
function retrieveCPULoad(){
    axios.get(URL+"/getCPULoad")
    .then(function (response){
        store.state.ressourcemonitor.cpu.load=response.data.currentload.toFixed(2)
        store.state.ressourcemonitor.cpu.loads=response.data.cpus
    })
    .catch(function (){
        
    });
}
function retrieveCPUTemp(){
    axios.get(URL+"/getCPUTemp")
    .then(function (response){
        store.state.ressourcemonitor.cpu.temp=response.data.main.toFixed(2)
        store.state.ressourcemonitor.cpu.temps=response.data.cores
    })
    .catch(function (){
        
    });
}
function retrieveRAM(){
    axios.get(URL+"/getRAM")
    .then(function (response){
        store.state.ressourcemonitor.ram.modules=response.data
    })
    .catch(function (){
        
    });
}
function retrieveRAMLoad(){
    axios.get(URL+"/getRAMLoad")
    .then(function (response){
        store.state.ressourcemonitor.ram.total=response.data.total;
        store.state.ressourcemonitor.ram.used=response.data.used;
        store.state.ressourcemonitor.ram.totalswap=response.data.swaptotal;
        store.state.ressourcemonitor.ram.usedswap=response.data.swapused;
        store.commit('ressourcemonitor/ramHistory/addValue', { name: "Ram", value: (response.data.used/1024/1024/1024).toFixed(2), time: now });
        store.commit('ressourcemonitor/ramHistory/addValue', { name: "Ram_target", value: (response.data.total/1024/1024/1024).toFixed(0), time: now });
        store.commit('ressourcemonitor/ramHistory/addValue', { name: "Swap", value: (response.data.swapused/1024/1024/1024).toFixed(2), time: now });
    })
    .catch(function (){
        
    });
}