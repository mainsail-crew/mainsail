import { findDirectory } from "@/plugins/helpers"
import { themeDir } from "@/store/variables"

export default {

	getSidebarLogo: (state, getters, rootState, rootGetters) => {
		let configDir = findDirectory(state.filetree, ['config', themeDir])

		let file = configDir.find(element =>
			element.filename !== undefined && (
				element.filename === 'sidebar-logo.svg' ||
				element.filename === 'sidebar-logo.jpg' ||
				element.filename === 'sidebar-logo.jpeg' ||
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
				element.filename === 'sidebar-background.jpeg' ||
				element.filename === 'sidebar-background.png' ||
				element.filename === 'sidebar-background.gif'
			)
		)
		if (file) return rootGetters["socket/getUrl"]+'/server/files/config/'+themeDir+'/'+file.filename

		return '/img/sidebar-background.png'
	},

	getMainBackground: (state, getters, rootState, rootGetters) => {
		let configDir = findDirectory(state.filetree, ['config', themeDir])

		let file = configDir.find(element =>
			element.filename !== undefined && (
				element.filename === 'main-background.jpg' ||
				element.filename === 'main-background.jpeg' ||
				element.filename === 'main-background.png' ||
				element.filename === 'main-background.gif'
			)
		)
		if (file) return 'url('+rootGetters["socket/getUrl"]+'/server/files/config/'+themeDir+'/'+file.filename+')'

		return 'transparent'
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
		let favicon16Default = '/img/icons/favicon-16x16.png'

		let favicon32 = configDir.find(element => element.filename !== undefined &&  element.filename === 'favicon-32x32.png')
		if (favicon32) favicon32 = rootGetters["socket/getUrl"]+'/server/files/config/'+themeDir+'/'+favicon32.filename
		let favicon32Default = '/img/icons/favicon-32x32.png'

		if (favicon16 && favicon32) return [favicon16, favicon32]
		else if (favicon16) return [favicon16, favicon16]
		else if (favicon32) return [favicon32, favicon32]

		return [favicon16Default, favicon32Default]
	},

	getDiskUsage: (state) => (path) => {
		if (path.indexOf('/') !== -1) path = path.substr(0, path.indexOf('/'))

		const dir = state.filetree.find(dir => dir.filename === path)
		if (dir && 'disk_usage' in dir) return dir.disk_usage

		return {
			free: 0,
			total: 0,
			used: 0,
		}
	}
}
