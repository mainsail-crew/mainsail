import store from '../store/index'

const axios = require('axios');

var URL = store.state.gui.modules.ressourcemonitorUrl;

setInterval(retrieveData,1000);

function retrieveData(){
    URL = store.state.gui.modules.ressourcemonitorUrl;
    if(!URL.startsWith("https://")&&!URL.startsWith("http://")){
        return;
    }
    axios.get(URL)
    .then(function (){
        store.dispatch('gui/setData', { dashboard: { boolRessourceMonitorAvailable: true } });
        retrieveCPU();
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
        store.state.ressourcemonitor.cpu.freqcurrent=response.data.speed
        store.state.ressourcemonitor.cpu.freqmin=response.data.speedmin
        store.state.ressourcemonitor.cpu.freqmax=response.data.speedmax
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
    })
    .catch(function (){
        
    });
}