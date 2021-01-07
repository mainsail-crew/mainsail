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
	},

	getFavicons: (state, getters, rootState, rootGetters) => {
		let configDir = findDirectory(state.filetree, ['config', themeDir])

		let favicon16 = configDir.find(element => element.filename !== undefined &&  element.filename === 'favicon-16x16.png')
		if (favicon16) favicon16 = rootGetters["socket/getUrl"]+'/server/files/config/'+themeDir+'/'+favicon16.filename
		let favicon16Default = '/img/favicon-16x16.png'

		let favicon32 = configDir.find(element => element.filename !== undefined &&  element.filename === 'favicon-32x32.png')
		if (favicon32) favicon32 = rootGetters["socket/getUrl"]+'/server/files/config/'+themeDir+'/'+favicon32.filename
		let favicon32Default = '/img/favicon-32x32.png'

		if (favicon16 && favicon32) return [favicon16, favicon32]
		else if (favicon16) return [favicon16, favicon16]
		else if (favicon32) return [favicon32, favicon32]

		return [favicon16Default, favicon32Default]
	},
}