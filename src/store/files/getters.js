import { findDirectory } from "@/plugins/helpers"
import { themeDir } from "@/store/variables"

export default {

	getSidebarLogo: (state, getters, rootState, rootGetters) => {
		let configDir = findDirectory(state.filetree, ['config', themeDir])
		const acceptName = "sidebar-logo"
		const acceptExtensions = ['svg', 'jpg', 'jpeg', 'png', 'gif']

		let file = configDir.find(element =>
			element.filename !== undefined && (
				element.filename.substr(0, element.filename.lastIndexOf('.')) === acceptName &&
				acceptExtensions.includes(element.filename.substr(element.filename.lastIndexOf('.')+1))
			)
		)
		if (file) return rootGetters["socket/getUrl"]+'/server/files/config/'+themeDir+'/'+file.filename

		return '/img/logo.svg'
	},

	getSidebarBackground: (state, getters, rootState, rootGetters) => {
		let configDir = findDirectory(state.filetree, ['config', themeDir])
		const acceptName = "sidebar-background"
		const acceptExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg']

		let file = configDir.find(element =>
			element.filename !== undefined && (
				element.filename.substr(0, element.filename.lastIndexOf('.')) === acceptName &&
				acceptExtensions.includes(element.filename.substr(element.filename.lastIndexOf('.')+1))
			)
		)
		if (file) return rootGetters["socket/getUrl"]+'/server/files/config/'+themeDir+'/'+file.filename

		return '/img/sidebar-background.svg'
	},

	getMainBackground: (state, getters, rootState, rootGetters) => {
		let configDir = findDirectory(state.filetree, ['config', themeDir])
		const acceptName = "main-background"
		const acceptExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg']

		let file = configDir.find(element =>
			element.filename !== undefined && (
				element.filename.substr(0, element.filename.lastIndexOf('.')) === acceptName &&
				acceptExtensions.includes(element.filename.substr(element.filename.lastIndexOf('.')+1))
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
