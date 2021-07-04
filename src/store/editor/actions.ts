import {ActionTree} from "vuex";
import {EditorState} from "@/store/editor/types";
import {RootState} from "@/store/types";
import axios from "axios";

export const actions: ActionTree<EditorState, RootState> = {
	reset({ commit }) {
		commit('reset')
	},

	openFile({ state, dispatch, commit, rootGetters }, payload) {
		const fullFilepath = payload.root+payload.path+"/"+payload.filename
		const url = rootGetters['socket/getUrl'] + '/server/files/' + encodeURI(fullFilepath) + `?${Date.now()}`

		if (state.cancelToken) dispatch('cancelLoad')

		const CancelToken = axios.CancelToken
		const source = CancelToken.source()
		commit('updateCancelTokenSource', source)
		commit('updateLoaderState', true)

		axios.get(url, {
			cancelToken: source.token,
			onDownloadProgress: (progressEvent) => {
				let speedOutput: string = state.loaderProgress.speed
				let lastTimestamp = state.loaderProgress.lastTimestamp
				let lastLoaded = state.loaderProgress.lastLoaded
				const diffTime = progressEvent.timeStamp - state.loaderProgress.lastTimestamp;
				if (diffTime > 500) {
					const diffData = progressEvent.loaded - lastLoaded;
					let speed = (diffData / diffTime);
					const unit = ['kB', 'MB', 'GB'];
					let unitSelect = 0;
					while (speed > 1024) {
						speed /= 1024.0;
						unitSelect = Math.min(2, unitSelect + 1);
					}
					speedOutput = speed.toFixed(2) + unit[unitSelect]
					lastTimestamp = progressEvent.timeStamp
					lastLoaded = progressEvent.loaded
				}

				this.commit('editor/updateLoader', {
					speed: speedOutput,
					loaded: progressEvent.loaded,
					total: progressEvent.total,
					lastLoaded: lastLoaded,
					lastTimestamp: lastTimestamp
				})
			}
		})  .then(res => res.data)
			.then(file => {
				commit('openFile', file)
			})
			.finally(() => {
				setTimeout(() => {
					dispatch('clearLoader')
				}, 100);
			});
	},

	cancelLoad({ state, commit, dispatch }) {
		if (state.cancelToken) {
			state.cancelToken.cancel("User canceled upload/download")
			commit('updateCancelTokenSource', null)
			dispatch('clearLoader')
		}
	},

	clearLoader({ commit }) {
		commit('updateLoaderState', false)
		commit('updateLoader', {
			lastLoaded: 0,
			lastTimestamp: 0,
			loaded: 0,
			total: 0,
			speed: '',
		})
	},

	close({ commit }) {
		commit('hideEditor')
	}
}