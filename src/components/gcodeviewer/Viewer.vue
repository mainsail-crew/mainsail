<template>
	<v-card>
		<v-card-title>
			<v-icon>mdi-video-3d</v-icon>
			{{ $t('GCodeViewer.Title') }}
			<v-spacer></v-spacer>
			<v-btn @click="tracking=true" v-show="showTrackingButton">Track Print</v-btn>
		</v-card-title>
		<v-card-text>
			<v-row>
				<v-col cols="2">
					<v-btn @click="chooseFile" block>{{ $t("GCodeViewer.LoadLocal") }}</v-btn>
					<v-btn @click="resetCamera" block class="mt-1">{{ $t("GCodeViewer.ResetCamera")}}</v-btn>

					<v-select :items="renderQualities" :label="$t('GCodeViewer.RenderQuality')" attach class="mt-1" item-text="label" v-model="renderQuality"></v-select>
					<v-checkbox :label="$t('GCodeViewer.ForceLineRendering')" v-model="forceLineRendering"></v-checkbox>
				</v-col>
				<v-col cols="10" ref="viewerCanvasContainer">
					<v-progress-linear :value="loadingPercent" class="disable-transition" color="#d41216" height="15" rounded v-show="loading">
						<span class="progress-text">{{loadingPercent}}%</span>
					</v-progress-linear>
				</v-col>
			</v-row>
			<input :accept="'.g,.gcode,.gc,.gco,.nc,.ngc,.tap'" @change="fileSelected" hidden multiple ref="fileInput" type="file" />
		</v-card-text>
	</v-card>
</template>

<!-- Because the viewer lives outside of the components DOM it can't be scoped -->
<style>
.viewer {
	width: 100%;
	height: 100%;
	border: 1px solid #3f3f3f;
}
</style>

<style scoped>
.progress-text {
	font-size: small;
}

.disable-transition {
	transition: none !important;
}
</style>

<script>
import {Component, Mixins, Prop, Ref, Watch} from 'vue-property-decorator';
import BaseMixin from '../mixins/base';
import GCodeViewer from '@sindarius/gcodeviewer';
let viewer;
let canvasBackup = null;
let loadedFileBackup = '';
let trackingBackup = false;

@Component
export default class Viewer extends Mixins(BaseMixin) {
	sBusy = false;
	loading = false;
	forceLineRendering = false;
	loadingPercent = 0;
	tracking = trackingBackup;
	loadedFile = loadedFileBackup //This needs to be set in order for vue tracking and computed values to work properly.

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

	get filePosition() {
		return this.printerIsPrinting ? this.$store.state.printer.virtual_sdcard.file_position : 0;
	}

	get sdCardFilePath() {
		return this.printerIsPrinting ? this.$store.state.printer.virtual_sdcard.file_path : '';
	}

	get currentPosition() {
		return this.$store.state.printer.motion_report.live_position;
	}

	get showTrackingButton() {
		return this.printerIsPrinting && this.sdCardFilePath !== this.loadedFile;
	}

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
		viewer.setCursorVisiblity(true);

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

		if (viewer.lastLoadFailed()) {
			this.renderQuality = 2;
			viewer.updateRenderQuality(2);
			viewer.clearLoadFlag();
		}
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
		this.tracking = false;
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
		this.loadingPercent = 0;
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
	async renderQualityChanged(newVal) {
		if (viewer.renderQuality !== newVal) {
			viewer.updateRenderQuality(newVal);
			await this.reloadViewer();
		}
	}

	@Watch('forceLineRendering')
	async forceLineRenderingChanged(newVal) {
		viewer.gcodeProcessor.updateForceWireMode(newVal);
		await this.reloadViewer();
	}

	@Watch('currentPosition')
	currentPositionChanged(newVal) {
		let position = [
			{axes: 'X', position: newVal[0]},
			{axes: 'Y', position: newVal[1]},
			{axes: 'Z', position: newVal[2]},
		];
		viewer.updateToolPosition(position);
	}

	@Watch('filePosition')
	filePositionChanged(newVal) {
		if (newVal > 0 && this.printerIsPrinting && this.tracking) {
			viewer.gcodeProcessor.setLiveTracking(true);
			viewer.gcodeProcessor.updateFilePosition(newVal);
		} else {
			viewer.gcodeProcessor.updateFilePosition(0);
			viewer.gcodeProcessor.setLiveTracking(false);
		}
	}

	@Watch('loadedFile')
	loadedFileChanged(newVal){
		loadedFileBackup =newVal;  //We need to keep the backup in sync for when component comes out of scope.
	}

	@Watch('tracking')
	async trackingChanged(newVal) {
		trackingBackup = newVal;
		if (newVal) {
			this.loadedFile = this.sdCardFilePath;
			let fileToLoad = this.sdCardFilePath.replace('/home/pi/gcode_files/', '');
			await this.loadFile(this.apiUrl + '/server/files/gcodes/' + encodeURI(fileToLoad));
		}
	}
}
</script>

