import router from "../plugins/router";


export default {



    setHeaterChartVisibility({ commit, dispatch }, data) {
        commit('setHeaterChartVisibility', data);
        dispatch('saveGuiSettings');
    },

    respondPrintPause({commit}) {
        commit('removeLoading', { name: 'statusPrintPause' });
    },

    respondPrintResume({commit}) {
        commit('removeLoading', { name: 'statusPrintResume' });
    },

    respondPrintCancel({commit}) {
        commit('removeLoading', { name: 'statusPrintCancel' });
    },

    respondPrintClear({commit}) {
        commit('removeLoading', { name: 'statusPrintClear' });
    },

    respondPrintReprint({commit}) {
        commit('removeLoading', { name: 'statusPrintReprint' });
    },

    responseHome({commit}) {
        commit('removeLoading', { name: 'controlHomeAll' });
    },

    responseHomeX({commit}) {
        commit('removeLoading', { name: 'controlHomeX' });
    },

    responseHomeY({commit}) {
        commit('removeLoading', { name: 'controlHomeY' });
    },

    responseHomeZ({commit}) {
        commit('removeLoading', { name: 'controlHomeZ' });
    },

    responseQGL({commit}) {
        commit('removeLoading', { name: 'controlQGL' });
    },

    responseZTilt({commit}) {
        commit('removeLoading', { name: 'controlZTilt' });
    },

    responseRestart({commit}) {
        commit('setLoadingRestart', false);
    },

    responseRestartFirmware({commit}) {
        commit('setLoadingRestartFirmware', false);
    },

    respondeExtruderRetract({commit}) {
        commit('removeLoading', { name: 'extruderRetract' });
    },

    respondeExtruderDetract({commit}) {
        commit('removeLoading', { name: 'extruderDetract' });
    },

    respondeBabySteppingDownFine({commit}) {
        commit('removeLoading', { name: 'babySteppingDownFine' });
    },

    respondeBabySteppingDown({commit}) {
        commit('removeLoading', { name: 'babySteppingDown' });
    },

    respondeBabySteppingUpFine({commit}) {
        commit('removeLoading', { name: 'babySteppingUpFine' });
    },

    respondeBabySteppingUp({commit}) {
        commit('removeLoading', { name: 'babySteppingUp' });
    },

    responseBedMeshLoad({commit}) {
        commit('removeLoading', { name: 'bedMeshLoad' });
    },

    responseBedMeshClear({commit}) {
        commit('removeLoading', { name: 'bedMeshClear' });
    },

    responseBedMeshCalibrate({commit}) {
        commit('removeLoading', { name: 'bedMeshCalibrate' });
    },

    responseBedMeshSave({commit}) {
        commit('removeLoading', { name: 'bedMeshSave' });
    },

    responseBedMeshRemove({commit}) {
        commit('removeLoading', { name: 'bedMeshRemove' });
    },

    responsePowerToggle({ commit }, data) {
        commit('setPowerDevicesStatus', data);
    },

    switchToDashboard() {
        router.push("/");
    },
}
