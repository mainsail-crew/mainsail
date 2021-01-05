import store from '../store/index'

const axios = require('axios');

var URL = store.state.gui.modules.ressourcemonitorUrl;

var now = Date.now();

var cpuColorArray;
var gpuColorArray;
var networkColorArray;

var functiontimerload=0;
var functiontimerhw=0;

retrieveDataOnce();

setGPUColors();
setNetworkColors();
setCPUColors();

setInterval(checkURL,1000);
setInterval(retrieveDataLoad,500);
setInterval(retrieveDataHW,2000);
//setInterval(resetData,10000);

//function resetData(){
//    console.log(store.state.ressourcemonitor.cpuFreqHistory.datasets[0])
//    store.commit('ressourcemonitor/cpuFreqHistory/setHistory', retrieveNewestDataset(store.state.ressourcemonitor.cpuFreqHistory.datasets));
//}

//function retrieveNewestDataset(dataset){
//var newdataset = []
//    dataset.forEach(function(data){
//        var newdata = []
//        var newestdata = data.data[data.data.length-1]
//        newdata.push(newestdata)
//        let newmarker = {
//            borderColor : data.borderColor,
//            borderWidth : data.borderWidth,
//            data : newdata,
//            fill : data.fill,
//            hidden : data.hidden,
//            label : data.label,
//            markerType : data.markerType
//        }
//        newdataset.push(newmarker)
//    })
//    return(newdataset)
//}

function checkURL(){
    var oldURL = URL;
    URL = store.state.gui.modules.ressourcemonitorUrl;
    if(!URL.startsWith("https://")&&!URL.startsWith("http://")){
        return;
    }
    if(URL!=oldURL){
        cpuColorArray=undefined;
        gpuColorArray=undefined;
        networkColorArray=undefined;
        functiontimerhw=0;
        functiontimerload=0;
        store.dispatch('gui/setData', { dashboard: { boolRessourceMonitorAvailable: false } });
    }
    now = Date.now();
    axios.get(URL,{timeout:900})
    .then(function (){
        store.dispatch('gui/setData', { dashboard: { boolRessourceMonitorAvailable: true } });
        if(typeof(gpuColorArray)==="undefined"){
            setGPUColors();
        }
        if(typeof(networkColorArray)==="undefined"){
            setNetworkColors();
        }
        if(URL!=oldURL){
            retrieveDataOnce();
            if(typeof(cpuColorArray)==="undefined"){
                setCPUColors();
            }
            store.state.ressourcemonitor.cpu.colors=cpuColorArray;
        }
    })
    .catch(function (){
        store.dispatch('gui/setData', { dashboard: { boolRessourceMonitorAvailable: false } });
        return;
    });
}

function retrieveDataLoad(){
    if(store.state.gui.dashboard.boolRessourceMonitorAvailable==true){
        if(functiontimerload==0){
            retrieveCPUSpeed();
            retrieveCPUTemp();
            retrieveCPULoad();
        }
        if(functiontimerload==1){
            retrieveRAMLoad();
        }
        if(functiontimerload==2){
            retrieveGPU();
        }
        if(functiontimerload==3){
            retrieveNetworkLoad();
        }
        if(functiontimerload==4){
            retrieveProcesses();
            functiontimerload=-1
        }
        functiontimerload++
    }
}
function retrieveDataHW(){
    if(store.state.gui.dashboard.boolRessourceMonitorAvailable==true){
        if(functiontimerhw==0){
            retrieveBIOS();
            retrieveMainboard();
        }
        if(functiontimerhw==1){
            retrieveChassis();
            retrieveSystem();
            retrieveOS();
        }
        if(functiontimerhw==2){
            retrieveCPU();
        }
        if(functiontimerhw==3){
            retrieveRAM();
        }
        if(functiontimerhw==4){
            retrieveNetwork();
        }
        if(functiontimerhw==5){
            retrieveDisks();
            retrievePartitions();
            functiontimerhw=-1
        }
        functiontimerhw++
    }
}

function retrieveDataOnce(){
    if(store.state.gui.dashboard.boolRessourceMonitorAvailable==true){
        retrieveChassis();
        retrieveSystem();
        retrieveBIOS()
        retrieveMainboard();
        retrieveCPU();
        retrieveCPUSpeed();
        retrieveCPULoad();
        retrieveCPUTemp();
        retrieveRAM();
        retrieveRAMLoad();
        retrieveGPU();
        retrieveNetwork();
        retrieveNetworkLoad();
        retrieveDisks();
        retrievePartitions();
        retrieveOS();
        retrieveProcesses();
    }
}

function retrieveSystem(){
    axios.get(URL+"/getSystem")
    .then(function (response){
        store.state.ressourcemonitor.system=response.data
    })
    .catch(function (){
        
    });
}

function retrieveChassis(){
    axios.get(URL+"/getChassis")
    .then(function (response){
        store.state.ressourcemonitor.chassis=response.data
    })
    .catch(function (){
        
    });
}

function retrieveBIOS(){
    axios.get(URL+"/getBIOS")
    .then(function (response){
        store.state.ressourcemonitor.bios=response.data
    })
    .catch(function (){
        
    });
}

function retrieveMainboard(){
    axios.get(URL+"/getMainboard")
    .then(function (response){
        store.state.ressourcemonitor.mainboard=response.data
    })
    .catch(function (){
        
    });
}

function retrieveCPU(){
    store.commit('ressourcemonitor/cpuFreqHistory/setColors', { colors: cpuColorArray});
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
        if(typeof(cpuColorArray)==="undefined"){
            cpuColorArray= new Array(response.data.cores+1)
            for(var color = 0;color < cpuColorArray.length;color++){
                cpuColorArray[color]=getRandomColor();
            }
        }
        store.state.ressourcemonitor.cpu.colors=cpuColorArray;
    })
    .catch(function (){
        
    });
}
function setGPUColors(){
    axios.get(URL+"/getGPU")
    .then(function (response){
        if(typeof(gpuColorArray)==="undefined"){
            gpuColorArray= new Array(response.data.controllers.length)
            for(var color = 0;color < gpuColorArray.length;color++){
                gpuColorArray[color]=getRandomColor();
            }
        }
        store.state.ressourcemonitor.gpu.colors=gpuColorArray;
    })
    .catch(function (){
        
    });
}
function setNetworkColors(){
    axios.get(URL+"/getNetwork")
    .then(function (response){
        if(typeof(networkColorArray)==="undefined"){
            networkColorArray= new Array(response.data.length)
            for(var color = 0;color < networkColorArray.length;color++){
                networkColorArray[color]=getRandomColor();
            }
        }
        store.state.ressourcemonitor.network.colors=networkColorArray;
    })
    .catch(function (){
        
    });
}
function retrieveCPUSpeed(){
    store.commit('ressourcemonitor/cpuLoadHistory/setColors', { colors: cpuColorArray});
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
    store.commit('ressourcemonitor/cpuTempHistory/setColors', { colors: cpuColorArray});
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
    store.commit('ressourcemonitor/gpuCoreFreqHistory/setColors', { colors: gpuColorArray});
    store.commit('ressourcemonitor/gpuMemFreqHistory/setColors', { colors: gpuColorArray});
    store.commit('ressourcemonitor/gpuTempHistory/setColors', { colors: gpuColorArray});
    store.commit('ressourcemonitor/gpuCoreHistory/setColors', { colors: gpuColorArray});
    store.commit('ressourcemonitor/gpuMemHistory/setColors', { colors: gpuColorArray});
    axios.get(URL+"/getGPU")
    .then(function (response){
        store.state.ressourcemonitor.gpu.cards=response.data.controllers
        store.state.ressourcemonitor.screens=response.data.displays
        fetchGPUChart(response.data.controllers)
    })
    .catch(function (){
        
    });
}

function fetchGPUChart(controllers){
    if(typeof(controllers) === "undefined"){
        return;
    }
    var card = 0;
    for(card=0;card < controllers.length+1;card++){
        var singleController = controllers[card];
        if(typeof(singleController) !== undefined){
            store.commit('ressourcemonitor/gpuCoreFreqHistory/addValue', { name: "Card"+card, value: singleController.clockCore.toFixed(2), time: now });
            store.commit('ressourcemonitor/gpuMemFreqHistory/addValue', { name: "Card"+card, value: singleController.clockMemory.toFixed(2), time: now });
            store.commit('ressourcemonitor/gpuTempHistory/addValue', { name: "Card"+card, value: singleController.temperatureGpu.toFixed(2), time: now });
            store.commit('ressourcemonitor/gpuTempHistory/addValue', { name: "Card"+card+"_target", value: 100, time: now });
            store.commit('ressourcemonitor/gpuCoreHistory/addValue', { name: "Card"+card, value: singleController.utilizationGpu.toFixed(2), time: now });
            store.commit('ressourcemonitor/gpuCoreHistory/addValue', { name: "Card"+card+"_target", value: 100, time: now });
            store.commit('ressourcemonitor/gpuMemHistory/addValue', { name: "Card"+card, value: singleController.memoryUsed.toFixed(2), time: now });
            store.commit('ressourcemonitor/gpuMemHistory/addValue', { name: "Card"+card+"_target", value: singleController.memoryTotal.toFixed(2), time: now });
        }
    }
}

function retrieveNetwork(){
    axios.get(URL+"/getNetwork")
    .then(function (response){
        store.state.ressourcemonitor.network.interfaces=response.data
    })
    .catch(function (){
        
    });
}

function retrieveNetworkLoad(){
    store.commit('ressourcemonitor/networkTransmitHistory/setColors', { colors: networkColorArray});
    store.commit('ressourcemonitor/networkReceiveHistory/setColors', { colors: networkColorArray});
    axios.get(URL+"/getNetworkStats")
    .then(function (response){
        fetchNetworkChart(response.data)
    })
    .catch(function (){
        
    });
}

function fetchNetworkChart(interfaces){
    if(typeof(interfaces) === "undefined"){
        return;
    }
    var card = 0;
    for(card=0;card < interfaces.length+1;card++){
        var singleInterface = interfaces[card];
        if(typeof(singleInterface) !== "undefined"){
            var transmit = singleInterface.tx_sec
            var receive = singleInterface.rx_sec
            if(transmit!=-1){
                store.commit('ressourcemonitor/networkTransmitHistory/addValue', { name: "Interface"+singleInterface.iface, value: (transmit/1024/1024).toFixed(2), time: now });
            }
            if(receive!=-1){
                store.commit('ressourcemonitor/networkReceiveHistory/addValue', { name: "Interface"+singleInterface.iface, value: (receive/1024/1024).toFixed(2), time: now });
            }
        }
    }
}

function retrieveDisks(){
    axios.get(URL+"/getDisks")
    .then(function (response){
        store.state.ressourcemonitor.filesystem.disks=response.data
    })
    .catch(function (){
        
    });
}

function retrievePartitions(){
    axios.get(URL+"/getPartitions")
    .then(function (response){
        store.state.ressourcemonitor.filesystem.partitions=response.data
        fetchPartitionChart(response.data)
    })
    .catch(function (){
        
    });
}

function retrieveOS(){
    axios.get(URL+"/getOS")
    .then(function (response){
        store.state.ressourcemonitor.os=response.data
    })
    .catch(function (){
        
    });
}

function retrieveProcesses(){
    axios.get(URL+"/getProcesses")
    .then(function (response){
        var data = []
        response.data.list.forEach(function(process){
            let miniprocess = {
                "pid" : process.pid,
                "name" : process.name,
                "pcpu" : process.pcpu.toFixed(2),
                "pmem" : process.pmem.toFixed(2),
                "mem_rss" : (process.mem_rss/1024).toFixed(2),
                "path" : process.path
            }
            data.push(miniprocess)
        })
        store.state.ressourcemonitor.processes=data
    })
    .catch(function (){
        
    });
}


function fetchPartitionChart(partitions){
    if(typeof(partitions) === "undefined"){
        return;
    }
    var part = 0;
    for(part=0;part < partitions.length+1;part++){
        var partition = partitions[part];
        if(typeof(partition) !== "undefined"){
            store.commit('ressourcemonitor/filesystemPartitionUsageHistory/addValue', { name: "Partition"+partition.fs, value: (partition.used/1024/1024/1024).toFixed(2), time: now });
            store.commit('ressourcemonitor/filesystemPartitionUsageHistory/addValue', { name: "Partition"+partition.fs+"_target", value: (partition.size/1024/1024/1024).toFixed(2), time: now });
        }
    }
}

function getRandomColor() {
	var randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
	return randomColor.toUpperCase();
}