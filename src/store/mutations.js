import Vue from "vue";

export default {


    /*setLoading(state, data) {
        if (!state.loadings.includes(data.name)) {
            state.loadings.push(data.name);
        }
    },

    removeLoading(state, data) {
        state.loadings = state.loadings.filter(function(ele){ return ele !== data.name; });
    },*/



    setGuiGcodefilesMetadata(state, data) {
        Vue.set(state.gui.gcodefiles.showMetadata, data.name, data.value);
    },


    setGuiGcodefilesShowHiddenFiles(state, value) {
        Vue.set(state.gui.gcodefiles, "showHiddenFiles", value);
    },

    reportError(state, payload) {
        window.console.log(payload);
    },

    void() {

    },
}
