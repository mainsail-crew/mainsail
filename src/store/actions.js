import router from "../plugins/router";


export default {


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

    switchToDashboard() {
        router.push("/");
    },
}
