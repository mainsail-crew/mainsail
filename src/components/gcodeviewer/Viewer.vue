<template>
	<div>
		<v-row>
			<v-col cols="2">
				<v-btn @click="chooseFile" block>{{ $t("GCodeViewer.LoadLocal") }}</v-btn>
				<v-btn @click="resetCamera" block class="mt-1">{{ $t("GCodeViewer.ResetCamera")}}</v-btn>
				<v-select :items="renderQualities" :label="$t('GCodeViewer.RenderQuality')" attach class="mt-1" item-text="label" v-model="renderQuality"></v-select>
				<v-checkbox :label="$t('GCodeViewer.ForceLineRendering')" v-model="forceLineRendering"></v-checkbox>
			</v-col>
			<v-col cols="10" ref="viewerCanvasContainer">
				<v-progress-linear :value="loadingPercent" color="#d41216" height="15" rounded v-show="loading">
					<span class="progress-text">{{loadingPercent}}%</span>
				</v-progress-linear>
			</v-col>
		</v-row>
		<input :accept="'.g,.gcode,.gc,.gco,.nc,.ngc,.tap'" @change="fileSelected" hidden multiple ref="fileInput" type="file" />
	</div>
</template>

<script>
import {Component, Mixins, Prop, Ref, Watch} from 'vue-property-decorator';
import BaseMixin from '../mixins/base';
import GCodeViewer from '@sindarius/gcodeviewer';
let viewer;
let canvasBackup = null;

@Component
export default class Viewer extends Mixins(BaseMixin) {
	isBusy = false;
	loading = false;
	forceLineRendering = false;
	loadedFile = '';
	loadingPercent = 0;

	renderQualities = [
		{label: this.$t('GCodeViewer.Low'), value: 2},
		{label: this.$t('GCodeViewer.Medium'), value: 3},
		{label: this.$t('GCodeViewer.High'), value: 4},
		{label: this.$t('GCodeViewer.Ultra'), value: 5},
		{label: this.$t('GCodeViewer.Max'), value: 6},
	];
	renderQuality = this.renderQualities[2];

	@Prop({type: String, default: '', required: false}) filename;

	@Ref('fileInput') fileInput;

	@Ref('viewerCanvasContainer') viewerCanvasContainer;

	mounted() {
		if (canvasBackup === null) {
			let canvasElement = document.createElement('canvas');
			canvasElement.className = 'viewer';
			this.viewerCanvasContainer.appendChild(canvasElement);
			canvasBackup = canvasElement;
			this.viewerInit(canvasElement);

			if (this.$route.query.filename) {
				this.loadFile(this.apiUrl + '/server/files/' + encodeURI(this.$route.query.filename));
			}
		} else {
			if (![this.loadedFile, '', null, undefined].includes(this.$route.query.filename)) {
				this.loadedFile = this.$route.query.filename;
				this.loadFile(this.apiUrl + '/server/files/' + encodeURI(this.$route.query.filename));
			}

			this.viewerCanvasContainer.appendChild(canvasBackup);
		}
		this.registerProgressCallback();
	}

	viewerInit(element) {
		viewer = new GCodeViewer(element);
		viewer.init();
		viewer.setBackgroundColor('#121212');
		viewer.setCursorVisiblity(false);
		viewer.gcodeProcessor.updateForceWireMode(this.forceLineRendering);

		window.addEventListener('resize', () => {
			this.$nextTick(() => {
				this.resize();
			});
		});
	}

	registerProgressCallback() {
		viewer.gcodeProcessor.loadingProgressCallback = (progress) => {
			this.loadingPercent = Math.ceil(progress * 100);
			if (this.loadingPercent > 99) {
				this.loading = false;
			} else {
				this.loading = true;
			}
		};
	}

	beforeDestroy() {
		viewer.gcodeProcessor.loadingProgressCallback = null;
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
			this.loading = false;
		});
		this.loadedFile = e.target.files[0].name;
		reader.readAsText(e.target.files[0]);
		e.target.value = '';
	}

	async loadFile(filename) {
		fetch(filename).then((response) => {
			response.text().then(async (text) => {
				await viewer.processFile(text);
				this.loading = false;
			});
		});
	}

	async reloadViewer() {
		await viewer.reload();
		this.loading = false;
	}

	resize() {
		//viewer.resize();
	}

	resetCamera() {
		viewer.resetCamera();
	}

	@Watch('renderQuality')
	renderQualityChanged(newVal) {
		if (viewer.renderQuality !== newVal) {
			viewer.updateRenderQuality(newVal);
			this.reloadViewer();
		}
	}

	@Watch('forceLineRendering')
	forceLineRenderingChanged(newVal) {
		viewer.gcodeProcessor.updateForceWireMode(newVal);
		this.reloadViewer();
	}
}
</script>

<style>
.viewer {
	width: 100%;
	height: 100%;
	border: 1px solid #3f3f3f;
}

.progress-text {
	font-size: small;
}
</style>