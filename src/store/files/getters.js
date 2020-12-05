import { findDirectory } from "@/plugins/helpers"
import { themeDir } from "@/store/variables"

export default {

	getSidebarBackground: (state, getters, rootState, rootGetters) => {
		let configDir = findDirectory(state.filetree, ['config', themeDir])

		let file = configDir.find(element =>
			element.filename !== undefined && (
				element.filename === 'sidebar-background.jpg' ||
				element.filename === 'sidebar-background.png' ||
				element.filename === 'sidebar-background.gif'
			)
		)
		if (file) return rootGetters["socket/getUrl"]+'/server/files/config/'+themeDir+'/'+file.filename

		return '/img/sidebar-background.png'
	},

	getCustomStylesheet: (state, getters, rootState, rootGetters) => {
		let configDir = findDirectory(state.filetree, ['config', themeDir])

		let file = configDir.find(element => element.filename !== undefined && element.filename === 'custom.css')
		if (file) return rootGetters["socket/getUrl"]+'/server/files/config/'+themeDir+'/'+file.filename

		return null
	}
}