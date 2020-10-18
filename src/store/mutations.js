import Vue from "vue";
const objectAssignDeep = require(`object-assign-deep`);
import { findDirectory } from '../plugins/helpers';
import { colorArray, colorChamber, colorHeaterBed/*, temperaturChartSampleLength*/ } from './variables';
import defaultPrinter from './printer';


export default {

    setConnected (state) {
        state.socket.isConnected = true;

        //TODO reset store
    },

    setDisconnected (state) {
        state.socket.isConnected = false;
    },

    setKlippyDisconnected(state) {
        Vue.set(state, '', {
            webhooks: {
                state: 'disconnected',
                state_message: 'Disconnected...'
            }
        });
    },

    resetPrinter(state) {
        //TODO check reset in storage
        let printer = { ...defaultPrinter };
        Object.assign(printer, { webhooks: state.printer.webhooks });

        Vue.set(state, "printer", printer);
        Vue.set(state, "helplist", []);
        Vue.set(state, "loadings", []);

        this.dispatch("initPrinter");
    },

    setServerInfo(state, data) {
        Object.entries(data).forEach(([key, value]) => {
            Vue.set(state.socket, key, value);
        });
    },

    setPrinterData(state, data) {
        if (data.requestParams) delete data.requestParams;
        let now = Date.now();

        Object.entries(data).forEach(([key, value]) => {

            //update/restart printer state
            if (
                key === "webhooks" &&
                state.printer.webhooks.state !== "ready" &&
                state.printer.webhooks.state !== "" &&
                value.state === "ready"
            ) {
                this.commit("resetPrinter");
            }

            //update printer state
            if (typeof(value) === "object") {
                Vue.set(state.printer, key, {
                    ...state.printer[key],
                    ...value
                });
            } else Vue.set(state.printer, key, value);

            //update heaters
            if (
                Array.isArray(state.printer.heaters.available_heaters) &&
                state.printer.heaters.available_heaters.length
            ) {
                let keySplit = key.split(" ");

                if (
                    state.printer.heaters.available_heaters.includes(key) ||
                    keySplit[0] === "temperature_fan" ||
                    keySplit[0] === "temperature_sensor" ||
                    keySplit[0] === "temperature_probe") {

                    if (keySplit[0] === "temperature_fan") key = keySplit[1];
                    else if (keySplit[0] === "temperature_sensor") key = keySplit[1];
                    else if (keySplit[0] === "heater_generic") key = keySplit[1];
                    else if (keySplit[0] === "temperature_probe") key = "probe";

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
        // definations for delete old entries
        let timeOld = new Date().getTime() - (1000 * 60 * 10);
        let minResolution = 1000;   // value in ms
        let deletedIndex;

        let index =  state.temperaturChart.findIndex(element => element.label === payload.name);
        if (index < 0) {
            this.commit('addTemperatureChartHeater', {
                name: payload.name,
                type: payload.type,
            });
            index =  state.temperaturChart.findIndex(element => element.label === payload.name);
        }
        let index_target =  state.temperaturChart.findIndex(element => element.label === payload.name+'_target');

        // update current temp in temperature chart
        if (index >= 0) {
            let temperature = 0;
            if (payload.value.temperature !== undefined) temperature = payload.value.temperature.toFixed(1);
            else if (state.temperaturChart[index].data.length) temperature = state.temperaturChart[index].data[state.temperaturChart[index].data.length - 1].y;

            if (
                (state.temperaturChart[index].data.length && (
                    (
                        state.temperaturChart[index].data[state.temperaturChart[index].data.length - 1].y !== temperature ||
                        payload.time-state.temperaturChart[index].data[state.temperaturChart[index].data.length - 1].x > minResolution
                    ) && state.temperaturChart[index].data[state.temperaturChart[index].data.length - 1].x < payload.time
                )) || state.temperaturChart[index].data.length === 0
            ) {
                state.temperaturChart[index].data.push({
                    x: payload.time,
                    y: temperature
                });
            }

            // delete old entries
            while ((deletedIndex = state.temperaturChart[index].data.findIndex(item => item.x < timeOld)) > -1) {
                state.temperaturChart[index].data.splice(deletedIndex, 1);
            }
        }

        // update target temp in temperature chart
        if (index_target >= 0) {
            let target = 0;
            if (payload.value.target !== undefined) target = payload.value.target.toFixed(1);
            else if (state.temperaturChart[index_target].data.length) target = state.temperaturChart[index_target].data[state.temperaturChart[index_target].data.length - 1].y;

            if (
                (state.temperaturChart[index_target].data.length && (
                    (
                        state.temperaturChart[index_target].data[state.temperaturChart[index_target].data.length - 1].y !== target ||
                        payload.time-state.temperaturChart[index_target].data[state.temperaturChart[index_target].data.length - 1].x > minResolution
                    ) && state.temperaturChart[index_target].data[state.temperaturChart[index_target].data.length - 1].x < payload.time
                )) || state.temperaturChart[index_target].data.length === 0
            ) {
                state.temperaturChart[index_target].data.push({
                    x: payload.time,
                    y: target
                });
            }

            // delete old entries
            while ((deletedIndex = state.temperaturChart[index_target].data.findIndex(item => item.x < timeOld)) > -1) {
                state.temperaturChart[index_target].data.splice(deletedIndex, 1);
            }
        }
    },

    addTemperatureChartHeater(state, payload) {
        let color = '';

        switch (payload.name) {
            case 'heater_bed': color = colorHeaterBed; break;
            case 'chamber': color = colorChamber; break;
            default: color = colorArray[state.temperaturChart.filter(element => !element.label.endsWith("_target") && element.label !== "heater_bed" && element.label !== "chamber").length]; break;
        }

        let hidden = state.gui.dashboard.hiddenTempChart.indexOf(payload.name.toUpperCase()) >= 0 ? true : null;

        state.temperaturChart.push({
            label: payload.name,
            data: [],
            borderColor: color,
            backgroundColor: color,
            pointBackgroundColor: color,
            fill: false,
            borderWidth: 2,
            hidden: hidden,
        });

        if (payload.type !== "temperature_sensor") {
            state.temperaturChart.push({
                label: payload.name+"_target",
                data: [],
                borderColor: color,
                backgroundColor: color+'20',
                pointBackgroundColor: color,
                fill: true,
                borderWidth: 0,
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

    setFileChangeUploadFile(state, data) {
        let filename = data.item.path;
        if (data.item.path.lastIndexOf("/") >= 0) filename = data.item.path.substr(data.item.path.lastIndexOf("/")).replace("/", "");
        let path = data.item.path.substr(0, data.item.path.lastIndexOf("/"));
        let parent = findDirectory(state.filetree, (data.item.root+"/"+path).split("/"));

        if (parent) {
            if (parent.findIndex(element => (!element.isDirectory && element.filename === filename)) < 0) {
                let modified = new Date(data.item.modified);

                parent.push({
                    isDirectory: false,
                    filename: filename,
                    modified: modified,
                    size: data.item.size,
                    metadataPulled: false,
                });
            }
        }
    },

    setFileChangeDeleteFile(state, data) {
        let currentPath = data.item.path.substr(0, data.item.path.lastIndexOf("/"));
        let delPath = data.item.path.substr(data.item.path.lastIndexOf("/")+1);
        currentPath = findDirectory(state.filetree, (data.item.root+"/"+currentPath).split("/"));
        let index = currentPath.findIndex(element => element.filename === delPath);

        if (index >= 0 && currentPath[index]) currentPath.splice(index, 1);
    },

    setFileChangeMoveItem(state, data) {
        let filenameOld = data.source_item.path.substr(data.source_item.path.lastIndexOf("/")+1);
        let oldPath = data.source_item.path.substr(0, data.source_item.path.lastIndexOf("/") + 1);

        let filenameNew = data.item.path.substr(data.item.path.lastIndexOf("/")+1);
        let newPath = data.item.path.substr(0, data.item.path.lastIndexOf("/") + 1);

        oldPath = findDirectory(state.filetree, (data.source_item.root+"/"+oldPath).split("/"));
        let indexFile = oldPath.findIndex(element => element.filename === filenameOld);

        if (indexFile >= 0 && oldPath[indexFile]) {
            let file = oldPath.splice(indexFile, 1)[0];
            file.filename = filenameNew;
            newPath = findDirectory(state.filetree, (data.item.root+"/"+newPath).split("/"));
            newPath.push(file);
        }
    },

    setFileChangeCreateDirectory(state, data) {
        let dirname = data.item.path.substr(data.item.path.lastIndexOf("/") + 1);
        let path = data.item.path.substr(0, data.item.path.lastIndexOf("/"));
        let parent = findDirectory(state.filetree, (data.item.root+"/"+path).split("/"));

        if (parent) {
            parent.push({
                isDirectory: true,
                filename: dirname,
                modified: new Date(),
                childrens: [],
            });
        }
    },

    setFileChangeDeleteDirectory(state, data) {
        let currentPath = data.item.path.substr(0, data.item.path.lastIndexOf("/"));
        let delPath = data.item.path.substr(data.item.path.lastIndexOf("/")+1);
        currentPath = findDirectory(state.filetree, (data.item.root+"/"+currentPath).split("/"));
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

                    Vue.prototype.$socket.sendObj('server.files.get_directory', { path: data.requestParams.path+'/'+dir.dirname }, 'getDirectory');
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
            if (data.filename === state.printer.print_stats.filename) {
                this.commit('setMetadataCurrentFile', { data: data });
            }

            let filename = "gcodes/"+data.filename;
            let dirArray = filename.split("/");
            filename = dirArray[dirArray.length-1];
            let path = findDirectory(state.filetree, dirArray);

            let index = path.findIndex(element => element.filename === filename);
            if (index >= 0 && path[index]) {
                const safeDefault = (value, def = undefined) => value ? value : def;
                let newData = {
                    estimated_time: safeDefault(data.estimated_time),
                    filament_total: safeDefault(data.filament_total),
                    first_layer_height: safeDefault(data.first_layer_height),
                    first_layer_bed_temp: safeDefault(data.first_layer_bed_temp),
                    first_layer_extr_temp: safeDefault(data.first_layer_extr_temp),
                    layer_height: safeDefault(data.layer_height),
                    object_height: safeDefault(data.object_height),
                    slicer: safeDefault(data.slicer),
                    slicer_version: safeDefault(data.slicer_version),
                    thumbnails: safeDefault(data.thumbnails),
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
            state.printer.current_file.thumbnails = [];
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

    setGcodeStore(state, data) {
        let splits = data.gcode_store.split('\n');
        let length = splits.length;
        let number = 0;

        if (splits.length) {
            splits.forEach(split => {
                state.events.push({
                    date: new Date(Date.now() - (length - number) * 1000),
                    message: split
                });

                number++;
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

    setPrinterStatusDetails(state, data) {
        if (data !== undefined && data.is_ready !== undefined) {
            state.socket.error_detected = data.error_detected;
            state.socket.is_ready = data.is_ready;
            state.socket.klippy_message = data.message;
        }
    },

    setPowerDevices(state, data) {
        Vue.set(state.power, 'devices', data);
    },

    setPowerDevicesStatus(state, data) {
        for (let key in data) {
            let devIdx = state.power.devices.findIndex(device => device.id === key);
            if (devIdx >= 0) {
                Vue.set(state.power.devices[devIdx], 'status', data[key] === 'off' ? 0 : 1);
            }
        }
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
