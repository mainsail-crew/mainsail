import Vue from 'vue'
import { getDefaultState } from './index'
import { findDirectory } from "@/plugins/helpers"
import {MutationTree} from "vuex";
import {
	ApiGetDirectoryReturn,
	ApiGetDirectoryReturnDir,
	ApiGetDirectoryReturnFile,
	FileState,
	FileStateFile
} from "@/store/files/types";

export const mutations: MutationTree<FileState> = {
	reset(state) {
		Object.assign(state, getDefaultState())
	},

	createRootDir(state, dirname) {
		state.filetree.push({
			isDirectory: true,
			filename: dirname,
			modified: new Date(),
			childrens: [],
			disk_usage: {
				free: 0,
				total: 0,
				used: 0
			}
		})
	},

	setMetadata(state, payload) {
		let filename = "gcodes/"+payload.filename;
		const dirArray = filename.split("/");
		filename = dirArray[dirArray.length-1];
		const path = findDirectory(state.filetree, dirArray);

		const index = path?.findIndex((element: FileStateFile) => element.filename === filename);
		if (index !== undefined && index >= 0 && path && path[index]) {

			const safeDefault = (value: string | number, def = undefined) => value ? value : def;
			const newData = {
				estimated_time: safeDefault(payload.estimated_time),
				filament_total: safeDefault(payload.filament_total),
				filament_weight_total: safeDefault(payload.filament_weight_total),
				first_layer_height: safeDefault(payload.first_layer_height),
				first_layer_bed_temp: safeDefault(payload.first_layer_bed_temp),
				first_layer_extr_temp: safeDefault(payload.first_layer_extr_temp),
				gcode_start_byte: safeDefault(payload.gcode_start_byte),
				gcode_end_byte: safeDefault(payload.gcode_end_byte),
				layer_height: safeDefault(payload.layer_height),
				object_height: safeDefault(payload.object_height),
				slicer: safeDefault(payload.slicer),
				slicer_version: safeDefault(payload.slicer_version),
				thumbnails: safeDefault(payload.thumbnails),
				metadataPulled: true,
				modified: new Date(payload.modified * 1000),
				size: parseInt(payload.size),
			}

			const newObject = Object.assign(path[index], newData)
			path[index] = newObject
		}
	},

	setCreateFile(state, payload) {
		let filename = payload.item.path
		if (payload.item.path.lastIndexOf("/") >= 0) filename = payload.item.path.substr(payload.item.path.lastIndexOf("/")).replace("/", "")
		const path = payload.item.path.substr(0, payload.item.path.lastIndexOf("/"))
		const parent = findDirectory(state.filetree, (payload.item.root+"/"+path).split("/"))

		if (parent) {
			const indexFile = parent.findIndex((element: FileStateFile) => (!element.isDirectory && element.filename === filename))

			if (indexFile === -1) {
				const modified = new Date(payload.item.modified * 1000)

				parent.push({
					isDirectory: false,
					filename: filename,
					modified: modified,
					size: payload.item.size,
					metadataPulled: false,
				})
			} else {
				parent[indexFile].modified = new Date(payload.item.modified * 1000)
				parent[indexFile].size = payload.item.size
				parent[indexFile].metadataPulled = false

				Vue.$socket.emit("server.files.metadata", { filename: payload.item.path }, "files/getMetadata")
			}
		}
	},

	setMoveFile(state, payload) {
		const filenameOld = payload.source_item.path.substr(payload.source_item.path.lastIndexOf("/")+1)
		let oldPath = payload.source_item.path.substr(0, payload.source_item.path.lastIndexOf("/") + 1)

		const filenameNew = payload.item.path.substr(payload.item.path.lastIndexOf("/")+1)
		let newPath = payload.item.path.substr(0, payload.item.path.lastIndexOf("/") + 1)

		oldPath = findDirectory(state.filetree, (payload.source_item.root+"/"+oldPath).split("/"))
		const indexFile = oldPath.findIndex((element: FileStateFile) => element.filename === filenameOld)

		if (indexFile >= 0 && oldPath[indexFile]) {
			const file = oldPath.splice(indexFile, 1)[0]
			file.filename = filenameNew

			//cleanup thumbnails and force reload
			if (
				'metadataPulled' in file &&
				file.metadataPulled &&
				'thumbnails' in file
			) {
				file.metadataPulled = false
				delete file.thumbnails
			}

			newPath = findDirectory(state.filetree, (payload.item.root+"/"+newPath).split("/"))
			newPath.push(file)
		}
	},

	setModifyFile(state, payload) {
		const filename = payload.item.path.substr(payload.item.path.lastIndexOf("/")+1)
		const filepath = payload.item.path.substr(0, payload.item.path.lastIndexOf("/") + 1)

		const path = findDirectory(state.filetree, (payload.item.root+"/"+filepath).split("/"))
		const indexFile = path?.findIndex((element: FileStateFile) => element.filename === filename)

		if (indexFile !== undefined && indexFile > -1 && path && path[indexFile]) {
			if (
				'metadataPulled' in path[indexFile] &&
				path[indexFile].metadataPulled
			) {
				path[indexFile].metadataPulled = false

				if ('thumbnails' in path[indexFile])
					delete path[indexFile].thumbnails
			}

			path[indexFile].modified = new Date(payload.item.modified*1000)
			path[indexFile].size = payload.item.size
		}
	},

	setMoveDir(state, payload) {
		const dirnameOld = payload.source_item.path.substr(payload.source_item.path.lastIndexOf("/")+1)
		let oldPath = payload.source_item.path.substr(0, payload.source_item.path.lastIndexOf("/") + 1)

		const dirnameNew = payload.item.path.substr(payload.item.path.lastIndexOf("/")+1)
		let newPath = payload.item.path.substr(0, payload.item.path.lastIndexOf("/") + 1)

		oldPath = findDirectory(state.filetree, (payload.source_item.root+"/"+oldPath).split("/"))
		const indexDir = oldPath?.findIndex((element: FileStateFile) => element.filename === dirnameOld)

		if (indexDir >= 0 && oldPath[indexDir]) {
			const dir = oldPath.splice(indexDir, 1)[0]
			dir.filename = dirnameNew

			newPath = findDirectory(state.filetree, (payload.item.root+"/"+newPath).split("/"))
			newPath.push(dir)
		}
	},

	setDeleteFile(state, payload) {
		let currentPath = payload.item.path.substr(0, payload.item.path.lastIndexOf("/"));
		const delPath = payload.item.path.substr(payload.item.path.lastIndexOf("/")+1);
		currentPath = findDirectory(state.filetree, (payload.item.root+"/"+currentPath).split("/"));
		const index = currentPath.findIndex((element: FileStateFile) => element.filename === delPath);

		if (index >= 0 && currentPath[index]) currentPath.splice(index, 1);
	},

	setCreateDir(state, payload) {
		const dirname = payload.item.path.substr(payload.item.path.lastIndexOf("/") + 1);
		const path = payload.item.path.substr(0, payload.item.path.lastIndexOf("/"));
		const parent = findDirectory(state.filetree, (payload.item.root+"/"+path).split("/"));

		if (parent) {
			parent.push({
				isDirectory: true,
				filename: dirname,
				modified: new Date(),
				childrens: [],
			});
		}
	},

	setDeleteDir(state, payload) {
		let currentPath = payload.item.path.substr(0, payload.item.path.lastIndexOf("/"));
		const delPath = payload.item.path.substr(payload.item.path.lastIndexOf("/")+1);
		currentPath = findDirectory(state.filetree, (payload.item.root+"/"+currentPath).split("/"));
		const index = currentPath.findIndex((element: FileStateFile) => element.filename === delPath);

		if (index >= 0 && currentPath[index]) currentPath.splice(index, 1);
	},

	setRootUpdate(state, payload) {
		const index = state.filetree.findIndex(root => root.filename === payload.item.root)
		if (index !== -1 && state.filetree[index].childrens?.length) {
			state.filetree[index].childrens?.splice(0, state.filetree[index].childrens?.length)
		}
	},

	setDiskUsage(state, payload) {
		let path = payload.path
		if (path.indexOf('/') !== -1) path = path.substr(0, path.indexOf('/'))

		const dir = state.filetree.find(dir => dir.filename === path)
		if (dir && 'disk_usage' in dir) Vue.set(dir, "disk_usage", payload.disk_usage)
	}
}