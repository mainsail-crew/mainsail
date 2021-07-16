import { findDirectory } from "@/plugins/helpers"
import { themeDir } from "@/store/variables"
import {GetterTree} from "vuex";
import {FileState, FileStateFile} from "@/store/files/types";

export const getters: GetterTree<FileState, any> = {

	getThemeFileUrl: (state, getters, rootState, rootGetters) => (acceptName: string, acceptExtensions: string[]) => {
		const directory = findDirectory(state.filetree, ['config', themeDir])

		const file = directory?.find((element: FileStateFile) =>
			element.filename !== undefined && (
				element.filename.substr(0, element.filename.lastIndexOf('.')) === acceptName &&
				acceptExtensions.includes(element.filename.substr(element.filename.lastIndexOf('.')+1))
			)
		)
		return (file) ? rootGetters["socket/getUrl"]+'/server/files/config/'+themeDir+'/'+file.filename : null
	},

	getSidebarLogo: (state, getters) => {
		const acceptName = "sidebar-logo"
		const acceptExtensions = ['svg', 'jpg', 'jpeg', 'png', 'gif']

		return getters['getThemeFileUrl'](acceptName, acceptExtensions) ?? ''
	},

	getSidebarBackground: (state, getters) => {
		const acceptName = "sidebar-background"
		const acceptExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg']

		return getters['getThemeFileUrl'](acceptName, acceptExtensions) ?? '/img/sidebar-background.svg'
	},

	getMainBackground: (state, getters) => {
		const acceptName = "main-background"
		const acceptExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg']

		return getters['getThemeFileUrl'](acceptName, acceptExtensions) ?? 'transparent'
	},

	getCustomStylesheet: (state, getters) => {
		const acceptName = "custom"
		const acceptExtensions = ['css']

		return getters['getThemeFileUrl'](acceptName, acceptExtensions) ?? null
	},

	getFavicons: (state, getters, rootState, rootGetters) => {
		const acceptName16 = "favicon-32x32"
		const acceptName32 = "favicon-32x32"
		const acceptExtensions = ['png', 'svg']

		const favicon16 = getters['getThemeFileUrl'](acceptName16, acceptExtensions)
		const favicon16Default = '/img/icons/favicon-16x16.png'
		const favicon32 = getters['getThemeFileUrl'](acceptName32, acceptExtensions)
		const favicon32Default = '/img/icons/favicon-32x32.png'

		if (favicon16 && favicon32) return [favicon16, favicon32]
		else if (favicon16) return [favicon16, favicon16]
		else if (favicon32) return [favicon32, favicon32]

		return [favicon16Default, favicon32Default]
	},

	getDiskUsage: (state) => (path: string) => {
		if (path.indexOf('/') === 0) path = path.substr(1)
		if (path.indexOf('/') !== -1) path = path.substr(0, path.indexOf('/'))

		const dir = state.filetree.find(dir => dir.filename === path)
		if (dir && 'disk_usage' in dir) return dir.disk_usage

		return null
	}
}
