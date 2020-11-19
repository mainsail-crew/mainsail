import router from "../plugins/router";


export default {
    setHeaterChartVisibility({ commit, dispatch }, data) {
        commit('setHeaterChartVisibility', data);
        dispatch('saveGuiSettings');
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
