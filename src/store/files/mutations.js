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
					'dirs' in payload &&
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
				if (!parent.find(element => (element.isDirectory === false && element.filename === file.filename))) {
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
				metapayloadPulled: true,
				modified: new Date(payload.modified * 1000),
				size: parseInt(payload.size),
			};

			let newObject = Object.assign(path[index], newData);
			Vue.set(path, index, newObject);
		}
	},

	setUploadFile(state, payload) {
		let filename = payload.item.path;
		if (payload.item.path.lastIndexOf("/") >= 0) filename = payload.item.path.substr(payload.item.path.lastIndexOf("/")).replace("/", "");
		let path = payload.item.path.substr(0, payload.item.path.lastIndexOf("/"));
		let parent = findDirectory(state.filetree, (payload.item.root+"/"+path).split("/"));

		if (parent) {
			if (parent.findIndex(element => (!element.isDirectory && element.filename === filename)) === -1) {
				let modified = new Date(payload.item.modified * 1000);

				parent.push({
					isDirectory: false,
					filename: filename,
					modified: modified,
					size: payload.item.size,
					metadataPulled: false,
				});
			} else Vue.prototype.$socket.sendObj("server.files.metadata", { filename: payload.item.path }, "files/getMetadata")
		}
	},

	setMoveItem(state, payload) {
		let filenameOld = payload.source_item.path.substr(payload.source_item.path.lastIndexOf("/")+1);
		let oldPath = payload.source_item.path.substr(0, payload.source_item.path.lastIndexOf("/") + 1);

		let filenameNew = payload.item.path.substr(payload.item.path.lastIndexOf("/")+1);
		let newPath = payload.item.path.substr(0, payload.item.path.lastIndexOf("/") + 1);

		oldPath = findDirectory(state.filetree, (payload.source_item.root+"/"+oldPath).split("/"));
		let indexFile = oldPath.findIndex(element => element.filename === filenameOld);

		if (indexFile >= 0 && oldPath[indexFile]) {
			let file = oldPath.splice(indexFile, 1)[0];
			file.filename = filenameNew;
			newPath = findDirectory(state.filetree, (payload.item.root+"/"+newPath).split("/"));
			newPath.push(file);
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
}