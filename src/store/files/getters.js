import { findDirectory } from "@/plugins/helpers";

export default {

	getBgNavi: (state, getters, rootState, rootGetters) => {
		let configDir = findDirectory(state.filetree, ['config'])

		let file = configDir.find(element => element.filename !== undefined && element.filename.startsWith('bg-navi.'))
		if (file) return rootGetters["socket/getUrl"]+'/server/files/config/'+file.filename

		return '/img/bg-navi.png'
	}
}