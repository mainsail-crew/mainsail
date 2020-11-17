export default {


    /*setLoading(state, data) {
        if (!state.loadings.includes(data.name)) {
            state.loadings.push(data.name);
        }
    },

    removeLoading(state, data) {
        state.loadings = state.loadings.filter(function(ele){ return ele !== data.name; });
    },*/


    reportError(state, payload) {
        window.console.log(payload)
    },

    void() {

    },
}
