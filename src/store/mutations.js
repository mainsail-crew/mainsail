import Vue from "vue";
const objectAssignDeep = require(`object-assign-deep`);
import { findDirectory } from '../plugins/helpers';
import { colorArray, colorChamber, colorHeaterBed, temperaturChartSampleLength } from './variables';

export default {

    setConnected (state) {
        state.socket.isConnected = true;

        //TODO reset store
    },

    setDisconnected (state) {
        state.socket.isConnected = false;
    },

    resetPrinter(state) {
        //TODO check reset in storage
        Vue.set(state, '', {
                state: {
                    loadings: [],
                    config: {},
                    object: {
                        heaters: {
                            available_heaters: []
                        }
                    },
                    temperaturChart: {
                        labels: [],
                        datasets: [],
                    },
                    helplist: [],
                    filetree: [],
                }
            }
        );
    },

    setPrinterData(state, data) {
        if (data.requestParams) delete data.requestParams;
        let now = Date.now();
        let updateTicks = false;

        Object.entries(data).forEach(([key, value]) => {
            Vue.set(state.printer, key, value);

            if (Array.isArray(state.object.heaters.available_heaters) && state.object.heaters.available_heaters.length) {
                let keySplit = key.split(" ");

                if (
                    state.object.heaters.available_heaters.includes(key) ||
                    keySplit[0] === "temperature_fan" ||
                    keySplit[0] === "temperature_sensor" ||
                    keySplit[0] === "temperature_probe") {
                    if (keySplit[0] === "temperature_fan") key = keySplit[1];
                    else if (keySplit[0] === "temperature_sensor") key = keySplit[1];
                    else if (keySplit[0] === "temperature_probe") key = "probe";

                    // increment update ticks array only 1 time per setPrinterData with heaters/sensors
                    if (!updateTicks) {
                        for (let index in state.temperaturChart.updateTicks) {
                            state.temperaturChart.updateTicks[index] += 1;
                        }

                        updateTicks = true;
                    }

                    // add object to update ticks array if it doesn't exists
                    if (state.temperaturChart.updateTicks[key] === undefined) {
                        state.temperaturChart.updateTicks[key] = 1;
                    }

                    this.commit('addTemperatureChartValue', { name: key, value: value, time: now });
                }
            }
        });
    },

    setHeaterHistory(state, data) {
        let now = new Date();

        if (data !== undefined) {
            Object.entries(data).sort().forEach(([key, datasets]) => {
                let keySplit = key.split(" ");

                if (keySplit.length > 1) key = keySplit[1];
                if (keySplit[0] === "temperature_probe") key = "probe";

                if (datasets.temperatures) {
                    let max = datasets.temperatures.length;
                    for (let i = 0; i < max; i++) {
                        let time = new Date(now.getTime() - 1000 * (max - i));
                        this.commit('addTemperatureChartValue', {
                            name: key,
                            value: {
                                temperature: datasets.temperatures[i],
                                target: datasets.targets[i],
                            },
                            type: keySplit[0],
                            time: time
                        });
                    }
                }
            });
        }
    },

    addTemperatureChartValue(state, payload) {
        if (state.temperaturChart.labels.map(Number).indexOf(+payload.time) < 0) {
            state.temperaturChart.labels.push(payload.time);

            if (state.temperaturChart.labels.length > temperaturChartSampleLength) {
                state.temperaturChart.labels = state.temperaturChart.labels.splice(state.temperaturChart.labels.length - temperaturChartSampleLength)
            }
        }

        let index =  state.temperaturChart.datasets.findIndex(element => element.label === payload.name);
        if (index < 0) {
            this.commit('addTemperatureChartHeater', {
                name: payload.name,
                type: payload.type,
            });
            index =  state.temperaturChart.datasets.findIndex(element => element.label === payload.name);
        }
        let index_target =  state.temperaturChart.datasets.findIndex(element => element.label === payload.name+'_target');

        let ticks = 1;

        // find missing ticks in update ticks array and reset it
        if (state.temperaturChart.updateTicks[payload.name] !== undefined) {
            ticks = state.temperaturChart.updateTicks[payload.name];
            state.temperaturChart.updateTicks[payload.name] = 0;
        }

        // update current temp in temperature chart
        if (index >= 0) {
            for (let i = 0; i < ticks; i++) state.temperaturChart.datasets[index].data.push(payload.value.temperature.toFixed(1));
        }

        // update target temp in temperature chart
        if (index_target >= 0 && payload.value.target !== undefined) {
            for (let i = 0; i < ticks; i++) state.temperaturChart.datasets[index_target].data.push(payload.value.target.toFixed(1));
        }

        if (index >= 0 && state.temperaturChart.datasets[index].data.length > temperaturChartSampleLength) {
            state.temperaturChart.datasets[index].data = state.temperaturChart.datasets[index].data.splice(state.temperaturChart.datasets[index].data.length - temperaturChartSampleLength)
        }

        if (index_target >= 0 && state.temperaturChart.datasets[index_target].data.length > temperaturChartSampleLength) {
            state.temperaturChart.datasets[index_target].data = state.temperaturChart.datasets[index_target].data.splice(state.temperaturChart.datasets[index_target].data.length - temperaturChartSampleLength)
        }
    },

    addTemperatureChartHeater(state, payload) {
        let color = '';

        switch (payload.name) {
            case 'heater_bed': color = colorHeaterBed; break;
            case 'chamber': color = colorChamber; break;
            default: color = colorArray[state.temperaturChart.datasets.filter(element => !element.label.endsWith("_target") && element.label !== "heater_bed" && element.label !== "chamber").length]; break;
        }

        let hidden = state.gui.dashboard.hiddenTempChart.indexOf(payload.name.toUpperCase()) >= 0 ? true : null;

        state.temperaturChart.datasets.push({
            label: payload.name,
            data: [],
            borderColor: color,
            backgroundColor: color,
            fill: false,
            borderDash: undefined,
            borderWidth: 2,
            pointRadius: 0,
            pointHitRadius: 5,
            showLine: true,
            lineTension: 0,
            hidden: hidden,
        });

        if (payload.type !== "temperature_sensor") {
            state.temperaturChart.datasets.push({
                label: payload.name+"_target",
                data: [],
                borderColor: color,
                backgroundColor: color+'20',
                fill: true,
                borderDash: undefined,
                borderWidth: 0,
                pointRadius: 0,
                pointHitRadius: 0,
                showLine: true,
                lineTension: 0,
                hidden: hidden,
            });
        }
    },

    setHeaterChartVisibility(state, data) {
        let index = state.gui.dashboard.hiddenTempChart.indexOf(data.name.toUpperCase());

        if (data.hidden && index === -1) state.gui.dashboard.hiddenTempChart.push(data.name.toUpperCase())
        else if (data.hidden !== true && index > -1) state.gui.dashboard.hiddenTempChart.splice(index, 1);
    },

    setSettings(state, data) {
        state = objectAssignDeep(state, data);
    },

    setObjectData(state, data) {
        Object.assign(state.object, data);
    },

    setPrinterConfig(state, data) {
        if (data.configfile) Vue.set(state, 'config', data.configfile.config);
    },

    setFileChangeAdded(state, data) {
        let filename = data.filename;
        if (data.filename.lastIndexOf("/") >= 0) filename = data.filename.substr(data.filename.lastIndexOf("/")).replace("/", "");
        let path = data.filename.substr(0, data.filename.lastIndexOf("/"));
        let parent = findDirectory(state.filetree, (data.root+"/"+path).split("/"));

        if (parent) {
            if (parent.findIndex(element => (!element.isDirectory && element.filename === filename)) < 0) {
                parent.push({
                    isDirectory: false,
                    filename: filename,
                    modified: new Date(),
                    size: 0,
                    metadataPulled: false,
                });
            }

            setTimeout(function() {
                Vue.prototype.$socket.sendObj("get_file_metadata", { filename: data.filename }, "getMetadata");
            }, 1000);
        }
    },

    setFileChangeRemoved(state, data) {
        let currentPath = data.filename.substr(0, data.filename.lastIndexOf("/"));
        let delPath = data.filename.substr(data.filename.lastIndexOf("/")+1);
        currentPath = findDirectory(state.filetree, (data.root+"/"+currentPath).split("/"));
        let index = currentPath.findIndex(element => element.filename === delPath);

        if (index >= 0 && currentPath[index]) currentPath.splice(index, 1);
    },

    setFileChangeFileMove(state, data) {
        let oldPath = data.prev_file.substr(0, data.prev_file.lastIndexOf("/") + 1);
        let newPath = data.filename.substr(0, data.filename.lastIndexOf("/") + 1);
        let filenameOld = data.prev_file.substr(data.prev_file.lastIndexOf("/")+1);
        let filenameNew = data.filename.substr(data.filename.lastIndexOf("/")+1);

        oldPath = findDirectory(state.filetree, (data.root+"/"+oldPath).split("/"));
        let indexFile = oldPath.findIndex(element => element.filename === filenameOld);

        if (indexFile >= 0 && oldPath[indexFile]) {
            let file = oldPath.splice(indexFile, 1)[0];
            file.filename = filenameNew;
            newPath = findDirectory(state.filetree, (data.root+"/"+newPath).split("/"));
            newPath.push(file);
        }
    },

    setFileChangeAddDirectory(state, data) {
        let filename = data.filename.substr(data.filename.lastIndexOf("/") + 1);
        let path = data.filename.substr(0, data.filename.lastIndexOf("/"));
        let parent = findDirectory(state.filetree, (data.root+"/"+path).split("/"));

        if (parent) {
            parent.push({
                isDirectory: true,
                filename: filename,
                modified: new Date(),
                childrens: [],
            });
        }
    },

    setFileChangeDeleteDirectory(state, data) {
        let currentPath = data.filename.substr(0, data.filename.lastIndexOf("/"));
        let delPath = data.filename.substr(data.filename.lastIndexOf("/")+1);
        currentPath = findDirectory(state.filetree, (data.root+"/"+currentPath).split("/"));
        let index = currentPath.findIndex(element => element.filename === delPath);

        if (index >= 0 && currentPath[index]) currentPath.splice(index, 1);
    },

    setDirectory(state, data) {
        let parent = undefined;
        //let parentPath = "";
        if (data && data.requestParams && data.requestParams.path) {
            let arrayPath = data.requestParams.path.split("/");
            parent = findDirectory(state.filetree, arrayPath);
            //parentPath = data.requestParams.path;
        }

        if (parent === undefined) parent = state.filetree;

        if (Array.isArray(parent) && parent.length) {
            for (const [key, item] of Object.entries(parent)) {
                if (
                    item.isDirectory &&
                    data.dirs !== undefined &&
                    data.dirs.length > 0 &&
                    data.dirs.findIndex(element => element.dirname === item.filename) < 0
                ) parent.splice(key, 1);
                else if (!item.isDirectory && data.files.findIndex(element => element.filename === item.filename) < 0) parent.splice(key, 1);
            }
        }

        if (data.dirs && data.dirs.length) {
            for (let dir of data.dirs) {
                if (!parent.find(element => (element.isDirectory === true && element.filename === dir.dirname))) {
                    parent.push({
                        isDirectory: true,
                        filename: dir.dirname,
                        modified: Date.parse(dir.modified),
                        childrens: [],
                    });

                    Vue.prototype.$socket.sendObj('get_directory', { path: data.requestParams.path+'/'+dir.dirname }, 'getDirectoryRoot');
                }
            }
        }

        if (data.files && data.files.length) {
            for (let file of data.files) {
                if (file.filename === "gui.json") continue;

                if (!parent.find(element => (element.isDirectory === false && element.filename === file.filename))) {
                    parent.push({
                        isDirectory: false,
                        filename: file.filename,
                        modified: Date.parse(file.modified),
                        size: parseInt(file.size),
                        metadataPulled: false,
                    });
                }
            }
        }
    },

    setMetadata(state, data) {
        if (data !== undefined && data.filename !== "") {
            let filename = "gcodes/"+data.filename;
            let dirArray = filename.split("/");
            filename = dirArray[dirArray.length-1];
            let path = findDirectory(state.filetree, dirArray);

            let index = path.findIndex(element => element.filename === filename);
            if (index >= 0 && path[index]) {
                let newData = {
                    estimated_time: data.estimated_time ? data.estimated_time : undefined,
                    filament_total: data.filament_total ? data.filament_total : undefined,
                    first_layer_height: data.first_layer_height ? data.first_layer_height : undefined,
                    layer_height: data.layer_height ? data.layer_height : undefined,
                    object_height: data.object_height ? data.object_height : undefined,
                    slicer: data.slicer ? data.slicer : undefined,
                    thumbnails: data.thumbnails ? data.thumbnails : undefined,
                    metadataPulled: true,
                    modified: Date.parse(data.modified),
                    size: parseInt(data.size),
                };

                let newObject = Object.assign(path[index], newData);
                Vue.set(path, index, newObject);
            }

        }
    },

    setMetadataCurrentFile(state, data) {
        if (data !== undefined && data.filename !== "") {
            Vue.set(state.printer, 'current_file', data);
        }
    },

    renameMetadataFilename(state, data) {
        let sourceDirArray = data.source.split("/");
        let sourceFilename = sourceDirArray[sourceDirArray.length-1];

        sourceDirArray.splice(-1,1);
        let sourcePath = findDirectory(state.filetree, sourceDirArray);

        let destDirArray = data.dest.split("/");
        let destFilename = destDirArray[destDirArray.length-1];

        let index = sourcePath.findIndex(element => element.filename === sourceFilename);

        if (destFilename === sourceFilename) {
            destDirArray.splice(-1,1);
            if (destDirArray[destDirArray.length-1] === "..") destDirArray.splice(-2,2);

            let destPath = findDirectory(state.filetree, destDirArray);
            destPath.push(sourcePath[index]);
            sourcePath.splice(index, 1);
        } else if (index >= 0 && sourcePath[index]) {
            let newObject = Object.assign(sourcePath[index], { filename: destFilename });
            Vue.set(sourcePath, index, newObject);
        }
    },

    setHelpList(state, data) {
        state.helplist = [];

        for (let [command, description] of Object.entries(data)) {
            state.helplist.push({
                'commandLow': command.toLowerCase(),
                'command': command,
                'description': description,
            });
        }
    },

    addGcodeResponse(state, data) {
        let message = data;

        if (message.result !== undefined) message = message.result;
        else if (message.error !== undefined) message = message.error.message;

        state.events.push({
            date: new Date(),
            message: message
        });

        if (message !== undefined && message.substring(0,2) === "!!") {
            Vue.$toast.error(message);
        }
    },

    setEndstopStatus(state, data) {
        delete data.requestParams;

        Vue.set(state.printer, 'endstops', data);
    },

    setLoading(state, data) {
        if (!state.loadings.includes(data.name)) {
            state.loadings.push(data.name);
        }
    },

    removeLoading(state, data) {
        state.loadings = state.loadings.filter(function(ele){ return ele !== data.name; });
    },

    setKlippyStatus(state, value) {
        if (value !== undefined) {
            state.socket.klippy_state = value;

            if (value === "disconnect") {
                state.socket.is_ready = false;
                state.socket.klippy_message = "";
            } else if (value === "ready") Vue.prototype.$socket.sendObj('get_printer_info', {}, 'getKlipperInfo');
        }
    },

    setPrinterStatusDetails(state, data) {
        if (data !== undefined && data.is_ready !== undefined) {
            state.socket.error_detected = data.error_detected;
            state.socket.is_ready = data.is_ready;
            state.socket.klippy_message = data.message;
        }
    },

    setLoadingGcodeUpload(state, value) {
        state.socket.loadingGcodeUpload = value;
    },

    setLoadingGcodeRefresh(state, value) {
        state.socket.loadingGcodeRefresh = value;
    },

    setLoadingEmergencyStop(state, value) {
        state.socket.loadingEmergencyStop = value;
    },

    setLoadingPrintPause(state, value) {
        state.socket.loadingPrintPause = value;
    },

    setLoadingPrintResume(state, value) {
        state.socket.loadingPrintResume = value;
    },

    setLoadingPrintCancel(state, value) {
        state.socket.loadingPrintCancel = value;
    },

    setLoadingQGL(state, value) {
        state.socket.loadingQGL = value;
    },

    setLoadingRestart(state, value) {
        state.socket.loadingRestart = value;
    },

    setLoadingRestartFirmware(state, value) {
        state.socket.loadingRestartFirmware = value;
    },

    setLoadingRebootHost(state, value) {
        state.socket.loadingRebootHost = value;
    },

    setLoadingShutdownHost(state, value) {
        state.socket.loadingShutdownHost = value;
    },

    setLoadingSaveGuiConfige(state, value) {
        state.socket.loadingSaveGuiConfig = value;
    },

    setLoadingEndstopStatus(state, value) {
        state.socket.loadingEndstopStatus = value;
    },

    reportError(state, data) {
        //Vue.$toast.error(data.message);
        window.console.log(data);
    },

    voidMutation() {

    },
}