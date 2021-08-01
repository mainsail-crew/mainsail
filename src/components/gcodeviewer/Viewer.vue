<template>
	<div>
		<v-row>
			<v-col cols="2">
				<v-btn @click="chooseFile" block>{{ $t("GCodeViewer.LoadLocal") }}</v-btn>
				<v-btn @click="resetCamera" block class="mt-1">{{ $t("GCodeViewer.ResetCamera")}}</v-btn>
			</v-col>
			<v-col cols="10">
				<canvas class="viewer" ref="viewerCanvas"></canvas>
			</v-col>
		</v-row>
		<input :accept="'.g,.gcode,.gc,.gco,.nc,.ngc,.tap'" @change="fileSelected" hidden multiple ref="fileInput" type="file" />
	</div>
</template>

<script>
import {Component, Mixins, Prop, Ref} from 'vue-property-decorator';
import BaseMixin from '../mixins/base';
import GCodeViewer from '@sindarius/gcodeviewer';
let viewer;

@Component
export default class Viewer extends Mixins(BaseMixin) {
	isBusy = false;
	loading = false;

	@Prop({type: String, default: '', required: false}) filename;

	@Ref('viewerCanvas') viewerCanvas;

	@Ref('fileInput') fileInput;

	mounted() {
		viewer = new GCodeViewer(this.viewerCanvas);
		viewer.init();
		viewer.setBackgroundColor('#121212');
		viewer.setCursorVisiblity(false);

		window.addEventListener('resize', () => {
			this.$nextTick(() => {
				this.resize();
			});
		});

		if (this.$route.query.filename) {
			this.loadFile(this.apiUrl + '/server/files/' + encodeURI(this.$route.query.filename));
		}
	}
	beforeDestroy() {
		//Add a dispose call since the context is not maintianed.
		viewer.dispose();
		viewer = null;
	}

	chooseFile() {
		if (!this.isBusy) {
			this.fileInput.click();
		}
	}

	async fileSelected(e) {
		const reader = new FileReader();
		reader.addEventListener('load', async (event) => {
			if (!event || !event.target) return;
			const blob = event.target.result;
			// Do something with result
			await viewer.processFile(blob);
		});
		this.loading = true;
		reader.readAsText(e.target.files[0]);
		e.target.value = '';
	}

	async loadFile(filename) {
		this.loading = true;
		fetch(filename).then(function (response) {
			response.text().then(async function (text) {
				await viewer.processFile(text);
			});
		});
	}

	resize() {
		//viewer.resize();
	}

	resetCamera() {
		viewer.resetCamera();
	}
}
</script>

<style>
.viewer {
	width: 100%;
	height: 100%;
	border: 1px solid #3F3F3F
}
</style>