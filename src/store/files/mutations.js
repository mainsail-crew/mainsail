import Vue from 'vue'
import { getDefaultState } from './index'
import { findDirectory } from "@/plugins/helpers"

export default {
	reset(state) {
		Object.assign(state, getDefaultState())
	},

	setDirectory(state, payload) {
		let parent = undefined;
		if (payload && payload.requestParams && payload.requestParams.path) {
			let arrayPath = payload.requestParams.path.split("/")
			parent = findDirectory(state.filetree, arrayPath)
		}

		if (parent === undefined) parent = state.filetree

		if (Array.isArray(parent) && parent.length) {
			for (const [key, item] of Object.entries(parent)) {
				if (
					item.isDirectory &&
					'filename' in item &&
					'dirs' in payload &&
					payload.dirs !== undefined &&
					payload.dirs.length > 0 &&
					payload.dirs.findIndex(element => element.dirname === item.filename) < 0
				) parent.splice(key, 1)
				else if (!item.isDirectory && payload.files.findIndex(element => element.filename === item.filename) < 0) parent.splice(key, 1)
			}
		}

		if (payload.dirs && payload.dirs.length) {
			for (let dir of payload.dirs) {
				if (!parent.find(element => (element.isDirectory === true && element.filename === dir.dirname))) {
					parent.push({
						isDirectory: true,
						filename: dir.dirname,
						modified: new Date(dir.modified * 1000),
						childrens: [],
					})

					Vue.prototype.$socket.sendObj('server.files.get_directory', { path: payload.requestParams.path+'/'+dir.dirname }, 'files/getDirectory');
				}
			}
		}

		if (payload.files && payload.files.length) {
			for (let file of payload.files) {
				const existingFile = parent.find(element => (element.isDirectory === false && element.filename === file.filename))

				if (
					existingFile && (
						existingFile.size !== file.size ||
						existingFile.modified.getTime() !== new Date(file.modified*1000).getTime()
					)
				) {
					Vue.set(existingFile, 'modified', new Date(file.modified*1000))
					Vue.set(existingFile, 'size', file.size)

					if (existingFile.metadataPulled) {
						Vue.prototype.$socket.sendObj("server.files.metadata", { filename: payload.requestParams.path+'/'+file.filename }, "files/getMetadata")
					}
				} else if (!existingFile) {
					parent.push({
						isDirectory: false,
						filename: file.filename,
						modified: new Date(file.modified * 1000),
						size: parseInt(file.size),
						metadataPulled: false,
					})
				}
			}
		}
	},

	setMetadata(state, payload) {
		let filename = "gcodes/"+payload.filename;
		let dirArray = filename.split("/");
		filename = dirArray[dirArray.length-1];
		let path = findDirectory(state.filetree, dirArray);

		let index = path.findIndex(element => element.filename === filename);
		if (index >= 0 && path[index]) {

			const safeDefault = (value, def = undefined) => value ? value : def;
			let newData = {
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
			};

			let newObject = Object.assign(path[index], newData);
			Vue.set(path, index, newObject);
		}
	},

	setCreateFile(state, payload) {
		let filename = payload.item.path;
		if (payload.item.path.lastIndexOf("/") >= 0) filename = payload.item.path.substr(payload.item.path.lastIndexOf("/")).replace("/", "");
		let path = payload.item.path.substr(0, payload.item.path.lastIndexOf("/"));
		let parent = findDirectory(state.filetree, (payload.item.root+"/"+path).split("/"));

		if (parent) {
			const indexFile = parent.findIndex(element => (!element.isDirectory && element.filename === filename))

			if (indexFile === -1) {
				let modified = new Date(payload.item.modified * 1000)

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

				Vue.prototype.$socket.sendObj("server.files.metadata", { filename: payload.item.path }, "files/getMetadata")
			}
		}
	},

	setMoveFile(state, payload) {
		let filenameOld = payload.source_item.path.substr(payload.source_item.path.lastIndexOf("/")+1)
		let oldPath = payload.source_item.path.substr(0, payload.source_item.path.lastIndexOf("/") + 1)

		let filenameNew = payload.item.path.substr(payload.item.path.lastIndexOf("/")+1)
		let newPath = payload.item.path.substr(0, payload.item.path.lastIndexOf("/") + 1)

		oldPath = findDirectory(state.filetree, (payload.source_item.root+"/"+oldPath).split("/"))
		let indexFile = oldPath.findIndex(element => element.filename === filenameOld)

		if (indexFile >= 0 && oldPath[indexFile]) {
			let file = oldPath.splice(indexFile, 1)[0]
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
		window.console.log(payload)
		window.console.log(state)

		const filename = payload.item.path.substr(payload.item.path.lastIndexOf("/")+1)
		const filepath = payload.item.path.substr(0, payload.item.path.lastIndexOf("/") + 1)

		const path = findDirectory(state.filetree, (payload.item.root+"/"+filepath).split("/"))
		const indexFile = path.findIndex(element => element.filename === filename)

		if (indexFile >= 0 && path[indexFile]) {
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
		let indexDir = oldPath.findIndex(element => element.filename === dirnameOld)

		if (indexDir >= 0 && oldPath[indexDir]) {
			let dir = oldPath.splice(indexDir, 1)[0]
			dir.filename = dirnameNew

			newPath = findDirectory(state.filetree, (payload.item.root+"/"+newPath).split("/"))
			newPath.push(dir)
		}
	},

	setDeleteFile(state, payload) {
		let currentPath = payload.item.path.substr(0, payload.item.path.lastIndexOf("/"));
		let delPath = payload.item.path.substr(payload.item.path.lastIndexOf("/")+1);
		currentPath = findDirectory(state.filetree, (payload.item.root+"/"+currentPath).split("/"));
		let index = currentPath.findIndex(element => element.filename === delPath);

		if (index >= 0 && currentPath[index]) currentPath.splice(index, 1);
	},

	setCreateDir(state, payload) {
		let dirname = payload.item.path.substr(payload.item.path.lastIndexOf("/") + 1);
		let path = payload.item.path.substr(0, payload.item.path.lastIndexOf("/"));
		let parent = findDirectory(state.filetree, (payload.item.root+"/"+path).split("/"));

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
		let delPath = payload.item.path.substr(payload.item.path.lastIndexOf("/")+1);
		currentPath = findDirectory(state.filetree, (payload.item.root+"/"+currentPath).split("/"));
		let index = currentPath.findIndex(element => element.filename === delPath);

		if (index >= 0 && currentPath[index]) currentPath.splice(index, 1);
	},

	setRootUpdate(state, payload) {
		const index = state.filetree.findIndex(root => root.filename === payload.item.root)
		if (index !== -1 && state.filetree[index].childrens.length) {
			state.filetree[index].childrens.splice(0, state.filetree[index].childrens.length)
		}
	},

	setDiskUsage(state, payload) {
		let path = payload.path
		if (path.indexOf('/') !== -1) path = path.substr(0, path.indexOf('/'))

		const dir = state.filetree.find(dir => dir.filename === path)
		if (dir && 'disk_usage' in dir) Vue.set(dir, "disk_usage", payload.disk_usage)
	}
}