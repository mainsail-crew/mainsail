import Vue from 'vue'
import { ActionTree } from "vuex"
import {
	ApiGetDirectoryReturn,
	ApiGetDirectoryReturnDir,
	ApiGetDirectoryReturnFile,
	FileState,
	FileStateFile
} from "@/store/files/types"
import {findDirectory} from "@/plugins/helpers"
import {RootState} from "@/store/types";

export const actions: ActionTree<FileState, RootState> = {
	reset({ commit }) {
		commit('reset')
	},

	initRootDirs({ state, commit }, dirs) {
		dirs.forEach((dirname: string) => {
			if (state.filetree.findIndex((tmp: FileStateFile) => tmp.filename === dirname) === -1) {
				commit("createRootDir", dirname)
				Vue.$socket.emit('server.files.get_directory', { path: dirname }, 'files/getDirectory')
			}
		})
	},

	getDirectory({ state, commit }, payload: ApiGetDirectoryReturn) {
		let root = ""
		let path = ""
		let parent: FileStateFile[] | null = state.filetree

		if (payload.requestParams?.path) {
			const pathArray = payload.requestParams.path.split("/")
			root = pathArray.length ? pathArray[0] : payload.requestParams.path

			const slashIndex = payload.requestParams.path.indexOf("/")
			path = slashIndex > 1 ? payload.requestParams.path.substr( slashIndex+ 1) : ""
			parent = findDirectory(state.filetree, pathArray)
		}

		if (parent?.length) {
			parent?.forEach((item: FileStateFile) => {
				if (item?.isDirectory && payload.dirs?.findIndex((element: ApiGetDirectoryReturnDir) => element.dirname === item.filename) < 0)
					commit('setDeleteDir', {
						item: {
							path: path.length ? path+"/"+item.filename : item.filename,
							root: root
						}
					})
				else if (!item?.isDirectory && payload.files?.findIndex((element: ApiGetDirectoryReturnFile) => element.filename === item.filename) < 0)
					commit('setDeleteFile', {
						item: {
							path: path.length ? path+"/"+item.filename : item.filename,
							root: root
						}
					})
			})
		}

		if (parent && payload.dirs?.length) {
			payload.dirs.forEach((dir: ApiGetDirectoryReturnDir) => {
				if (!parent?.find((element: FileStateFile) => (element.isDirectory && element.filename === dir.dirname))) {
					commit('setCreateDir', {
						item: {
							path: path.length ? path+"/"+dir.dirname : dir.dirname,
							root: root
						}
					})

					Vue.$socket.emit('server.files.get_directory', { path: payload.requestParams.path+'/'+dir.dirname }, 'files/getDirectory');
				}
			})
		}

		if (payload.files?.length) {
			payload.files.forEach((file: ApiGetDirectoryReturnFile) => {
				const existingFile = parent?.find((element: FileStateFile) => (!element.isDirectory && element.filename === file.filename))

				if (existingFile && (
					existingFile.size !== file.size ||
					existingFile.modified.getTime() !== new Date(file.modified*1000).getTime()
				)) {
					commit('setModifyFile', {
						item: {
							path: path.length ? path+"/"+file.filename : file.filename,
							root: root,
							modified: file.modified,
							size: file.size,
						}
					})
				} else if (!existingFile) {
					commit('setCreateFile', {
						item: {
							path: path.length ? path+"/"+file.filename : file.filename,
							root: root,
							modified: file.modified,
							size: file.size,
						}
					})
				}
			})
		}

		if (payload.requestParams?.path && payload.disk_usage) {
			commit('setDiskUsage', { disk_usage: payload.disk_usage, path: payload.requestParams.path })
		}
	},

	getMetadata({ commit, rootState }, payload) {
		if (payload !== undefined && payload.filename !== "") {
			if (payload.filename === rootState?.printer?.print_stats?.filename) {
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
			const filename = payload.requestParams.dest.substr(payload.requestParams.dest.lastIndexOf("/")).replace("/", "");
			const sourceDir = payload.requestParams.dest.substr(0, payload.requestParams.dest.lastIndexOf("/"));
			const destDir = payload.requestParams.dest.substr(0, payload.requestParams.dest.lastIndexOf("/"));

			if (sourceDir === destDir) Vue.$toast.success("Successfully renamed "+filename);
			else Vue.$toast.success("Successfully moved "+filename);
			commit('void', null, { root: true });
		}
	},

	getCreateDir({ commit }, payload) {
		if (payload.error) {
			Vue.$toast.error(payload.error.message);
		} else if (payload.result === "ok") {
			const newPath = payload.requestParams.path.substr(payload.requestParams.path.lastIndexOf("/")+1);

			Vue.$toast.success("Successfully created "+newPath);
			commit('void', null, { root: true });
		}
	},

	getDeleteDir({ commit }, payload) {
		if (payload.error) {
			Vue.$toast.error(payload.error.message);
		} else if (payload.result === "ok") {
			const delPath = payload.requestParams.path.substr(payload.requestParams.path.lastIndexOf("/")+1);

			Vue.$toast.success("Successfully deleted "+delPath);
			commit('void', null, { root: true });
		}
	},

	getDeleteFile({ commit }, payload) {
		if (payload.error) {
			Vue.$toast.error(payload.error.message);
		} else if ('result' in payload) {
			const delPath = payload.result.substr(payload.result.lastIndexOf("/")+1);

			Vue.$toast.success("Successfully deleted "+delPath);
			commit('void', null, { root: true });
		}
	},
}