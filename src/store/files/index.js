import actions from './actions'
import mutations from './mutations'
import getters from './getters'

export function getDefaultState() {
	return {
		filetree: [
			{
				isDirectory: true,
				filename: 'gcodes',
				modified: new Date(),
				childrens: [],
				disk_usage: {}
			},
			{
				isDirectory: true,
				filename: 'config_examples',
				modified: new Date(),
				childrens: [],
				disk_usage: {}
			},
			{
				isDirectory: true,
				filename: 'config',
				modified: new Date(),
				childrens: [],
				disk_usage: {}
			},
			{
				isDirectory: true,
				filename: 'docs',
				modified: new Date(),
				childrens: [],
				disk_usage: {}
			},
			{
				isDirectory: true,
				filename: 'logs',
				modified: new Date(),
				childrens: [],
				disk_usage: {}
			}
		],
	}
}

// initial state
const state = getDefaultState()

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}