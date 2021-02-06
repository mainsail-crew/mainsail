import Vue from 'vue'

export default {
	reset({ commit }) {
		commit('reset')
	},

	getDirectory({ commit }, payload) {
		commit('setDirectory', payload)

		if (
			'requestParams' in payload &&
			'path' in payload.requestParams &&
			'disk_usage' in payload
		) commit('setDiskUsage', {
			disk_usage: payload.disk_usage,
			path: payload.requestParams.path
		})
	},

	getMetadata({ commit, rootState }, payload) {
		if (payload !== undefined && payload.filename !== "") {
			if (payload.filename === rootState.printer.print_stats.filename) {
				commit('printer/clearCurrentFile', null, { root: true });
				commit('printer/setData', { current_file: payload }, { root: true });
			}

			commit('setMetadata', payload);
		}
	},

	getMetadataCurrentFile({ commit }, payload) {
		commit('printer/clearCurrentFile', null, { root: true });
		commit('printer/setData', { current_file: payload }, { root: true });
	},

	getMove({ commit }, payload) {
		if (payload.error) {
			Vue.$toast.error(payload.error.message);
		} else if (payload.result === "ok") {
			let filename = payload.requestParams.dest.substr(payload.requestParams.dest.lastIndexOf("/")).replace("/", "");
			let sourceDir = payload.requestParams.dest.substr(0, payload.requestParams.dest.lastIndexOf("/"));
			let destDir = payload.requestParams.dest.substr(0, payload.requestParams.dest.lastIndexOf("/"));

			if (sourceDir === destDir) Vue.$toast.success("Successfully renamed "+filename);
			else Vue.$toast.success("Successfully moved "+filename);
			commit('void', null, { root: true });
		}
	},

	getCreateDir({ commit }, payload) {
		if (payload.error) {
			Vue.$toast.error(payload.error.message);
		} else if (payload.result === "ok") {
			let newPath = payload.requestParams.path.substr(payload.requestParams.path.lastIndexOf("/")+1);

			Vue.$toast.success("Successfully created "+newPath);
			commit('void', null, { root: true });
		}
	},

	getDeleteDir({ commit }, payload) {
		if (payload.error) {
			Vue.$toast.error(payload.error.message);
		} else if (payload.result === "ok") {
			let delPath = payload.requestParams.path.substr(payload.requestParams.path.lastIndexOf("/")+1);

			Vue.$toast.success("Successfully deleted "+delPath);
			commit('void', null, { root: true });
		}
	},

	getDeleteFile({ commit }, payload) {
		if (payload.error) {
			Vue.$toast.error(payload.error.message);
		} else if ('result' in payload) {
			let delPath = payload.result.substr(payload.result.lastIndexOf("/")+1);

			Vue.$toast.success("Successfully deleted "+delPath);
			commit('void', null, { root: true });
		}
	},
}