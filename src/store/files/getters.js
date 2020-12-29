import { findDirectory } from "@/plugins/helpers"
import { themeDir } from "@/store/variables"

export default {

	getSidebarLogo: (state, getters, rootState, rootGetters) => {
		let configDir = findDirectory(state.filetree, ['config', themeDir])

		let file = configDir.find(element =>
			element.filename !== undefined && (
				element.filename === 'sidebar-logo.svg' ||
				element.filename === 'sidebar-logo.jpg' ||
				element.filename === 'sidebar-logo.png' ||
				element.filename === 'sidebar-logo.gif'
			)
		)
		if (file) return rootGetters["socket/getUrl"]+'/server/files/config/'+themeDir+'/'+file.filename

		return '/img/logo.svg'
	},

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