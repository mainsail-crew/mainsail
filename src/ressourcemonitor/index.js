import store from '../store/index'

const axios = require('axios');

var URL = store.state.gui.modules.ressourcemonitorUrl;

var now = Date.now();

var colorArray;

setInterval(retrieveData,1000);
setInterval(resetData,60000);

function resetData(){
    console.log("reste")
}

function retrieveData(){
    var oldURL = URL;
    URL = store.state.gui.modules.ressourcemonitorUrl;
    if(!URL.startsWith("https://")&&!URL.startsWith("http://")){
        return;
    }
    if(URL!=oldURL){
        colorArray=undefined;
    }
    now = Date.now();
    axios.get(URL)
    .then(function (){
        store.dispatch('gui/setData', { dashboard: { boolRessourceMonitorAvailable: true } });
        if(typeof(colorArray)==="undefined"){
            setCPUColors();
        }
        store.state.ressourcemonitor.cpu.colors=colorArray;
        retrieveCPU();
        retrieveCPUSpeed();
        retrieveCPULoad();
        retrieveCPUTemp();
        retrieveRAM();
        retrieveRAMLoad();
        retrieveGPU();
    })
    .catch(function (){
        store.dispatch('gui/setData', { dashboard: { boolRessourceMonitorAvailable: false } });
        return;
    });
}
function retrieveCPU(){
    store.commit('ressourcemonitor/cpuFreqHistory/setColors', { colors: colorArray});
    axios.get(URL+"/getCPU")
    .then(function (response){
        store.state.ressourcemonitor.cpu.vendor=response.data.manufacturer
        store.state.ressourcemonitor.cpu.brand=response.data.brand
        store.state.ressourcemonitor.cpu.cores=response.data.physicalCores
        store.state.ressourcemonitor.cpu.threads=response.data.cores
        store.state.ressourcemonitor.cpu.socket=response.data.socket
        store.state.ressourcemonitor.cpu.freqmin=response.data.speedmin
        store.state.ressourcemonitor.cpu.freqmax=response.data.speedmax
        store.commit('ressourcemonitor/cpuFreqHistory/addValue', { name: "All", value: response.data.speed, time: now });
    })
    .catch(function (){
        
    });
}
function setCPUColors(){
    axios.get(URL+"/getCPU")
    .then(function (response){
        if(typeof(colorArray)==="undefined"){
            colorArray= new Array(response.data.cores+1)
            for(var color = 0;color < colorArray.length;color++){
                colorArray[color]=getRandomColor();
            }
        }
    })
    .catch(function (){
        
    });
}
function retrieveCPUSpeed(){
    store.commit('ressourcemonitor/cpuLoadHistory/setColors', { colors: colorArray});
    axios.get(URL+"/getCPUSpeed")
    .then(function (response){
        store.state.ressourcemonitor.cpu.freqcores=response.data.cores
        fetchCPUFreqChart(response.data.cores)
    })
    .catch(function (){
        
    });
}
function fetchCPUFreqChart(cores){
    if(typeof(cores) === undefined){
        return;
    }
    var core = 0;
    for(core=0;core < store.state.ressourcemonitor.cpu.threads;core++){
        var coreFreq = cores[core];
        if(typeof(coreFreq) !== "undefined"){
            store.commit('ressourcemonitor/cpuFreqHistory/addValue', { name: "Core "+core, value: coreFreq.toFixed(2), time: now });
        }
    }
}
function retrieveCPULoad(){
    store.commit('ressourcemonitor/cpuTempHistory/setColors', { colors: colorArray});
    axios.get(URL+"/getCPULoad")
    .then(function (response){
        store.state.ressourcemonitor.cpu.load=response.data.currentload.toFixed(2)
        store.state.ressourcemonitor.cpu.loads=response.data.cpus
        store.commit('ressourcemonitor/cpuLoadHistory/addValue', { name: "All", value: response.data.currentload.toFixed(2), time: now });
        store.commit('ressourcemonitor/cpuLoadHistory/addValue', { name: "All_target", value: 100, time: now });
        fetchCPULoadChart(response.data.cpus)
    })
    .catch(function (){
        
    });
}
function fetchCPULoadChart(cores){
    if(typeof(cores) === undefined){
        return;
    }
    var core = 0;
    for(core=0;core < store.state.ressourcemonitor.cpu.threads;core++){
        var coreLoad = cores[core].load;
        if(typeof(coreLoad) !== "undefined"){
            store.commit('ressourcemonitor/cpuLoadHistory/addValue', { name: "Core "+core, value: coreLoad.toFixed(2), time: now });
        }
    }
}
function retrieveCPUTemp(){
    axios.get(URL+"/getCPUTemp")
    .then(function (response){
        store.state.ressourcemonitor.cpu.temp=response.data.main.toFixed(2)
        store.state.ressourcemonitor.cpu.temps=response.data.cores
        store.commit('ressourcemonitor/cpuTempHistory/addValue', { name: "All", value: response.data.main.toFixed(2), time: now });
        store.commit('ressourcemonitor/cpuTempHistory/addValue', { name: "All_target", value: 100, time: now });
        fetchCPUTempChart(response.data.cores)
    })
    .catch(function (){
        
    });
}
function fetchCPUTempChart(cores){
    if(typeof(cores) === undefined){
        return;
    }
    var core = 0;
    for(core=0;core < store.state.ressourcemonitor.cpu.threads;core++){
        var coreTemp = cores[core];
        if(typeof(coreTemp) !== "undefined"){
            store.commit('ressourcemonitor/cpuTempHistory/addValue', { name: "Core "+core, value: coreTemp.toFixed(2), time: now });
        }
    }
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
function retrieveGPU(){
    axios.get(URL+"/getGPU")
    .then(function (response){
        store.state.ressourcemonitor.gpu=response.data.controllers
        store.state.ressourcemonitor.screens=response.data.displays
    })
    .catch(function (){
        
    });
}
function getRandomColor() {
	var randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
	return randomColor.toUpperCase();
}