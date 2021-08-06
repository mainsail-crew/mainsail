<template>
	<v-card>
		<v-card-title>
			<v-icon>mdi-video-3d</v-icon>
			{{ $t('GCodeViewer.Title') }}
			<v-spacer></v-spacer>
			<v-btn @click="tracking=true" v-show="showTrackingButton">{{ $t("GCodeViewer.TrackPrint")}}</v-btn>
			<v-btn @click="reloadViewer()" color="info" v-show="reloadRequired">{{$t("GCodeViewer.ReloadRequired")}}</v-btn>
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
/* Can remove this when converted to typescript proper */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import {Component, Mixins, Prop, Ref, Watch} from 'vue-property-decorator';
import BaseMixin from '../mixins/base';
import GCodeViewer from '@sindarius/gcodeviewer';
let viewer;
let canvasBackup = null;
let loadedFileBackup = '';
let trackingBackup = false;

@Component
export default class Viewer extends Mixins(BaseMixin) {
	isBusy = false;
	loading = false;
	forceLineRendering = false;
	loadingPercent = 0;
	tracking = trackingBackup;
	loadedFile = loadedFileBackup; //This needs to be set in order for vue tracking and computed values to work properly.
	reloadRequired = false;

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
		try {
			return this.$store.state.printer.motion_report.live_position;
		} catch {
			return [0, 0, 0, 0];
		}
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
		viewer.axes.show(this.showAxes);
		viewer.gcodeProcessor.updateForceWireMode(this.forceLineRendering);
		viewer.gcodeProcessor.setLiveTracking(false);
		window.addEventListener('resize', () => {
			this.$nextTick(() => {
				this.resize();
			});
		});

		if (viewer.lastLoadFailed()) {
			this.renderQuality = this.renderQualities[0];
			viewer.updateRenderQuality(1);
			viewer.clearLoadFlag();
		}
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
		this.tracking = false;
		this.loadedFile = e.target.files[0].name;
		reader.readAsText(e.target.files[0]);
		e.target.value = '';
	}

	async loadFile(filename) {
		fetch(filename).then((response) => {
			response.text().then(async (text) => {
				viewer.updateRenderQuality(this.renderQuality.value);
				await viewer.processFile(text);
				this.loadingPercent = 100;
				this.loading = false;
			});
		});
	}

	async sleep() {
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	async reloadViewer() {
		if (this.loading) {
			//if we are actively loading signal a cancel and wait a second
			//This prevents a timing issue that can happen if a user changes settings and then
			//hits the reload viewer button. Will eventually move this to api
			viewer.gcodeProcessor.cancelLoad = true;
			await this.sleep();
		}

		this.reloadRequired = false;
		this.loading = true;
		this.loadingPercent = 0;
		await viewer.reload();
		this.loadingPercent = 100;
		this.loading = false;
	}

	resize() {
		//Code to handle canvas resizing
	}

	resetCamera() {
		viewer.resetCamera();
	}

	setReloadRequiredFlag() {
		if (this.loadedFile && this.loadedFile != '') {
			this.reloadRequired = true;
		}
	}

	@Watch('renderQuality')
	async renderQualityChanged(newVal) {
		if (viewer.renderQuality !== newVal) {
			viewer.updateRenderQuality(newVal.value);
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
			viewer.gcodeProcessor.updateFilePosition(newVal);
		} else {
			viewer.gcodeProcessor.updateFilePosition(0);
		}
	}

	@Watch('loadedFile')
	loadedFileChanged(newVal) {
		loadedFileBackup = newVal; //We need to keep the backup in sync for when component comes out of scope.
	}

	@Watch('tracking')
	async trackingChanged(newVal) {
		trackingBackup = newVal;
		if (newVal) {
			viewer.gcodeProcessor.setLiveTracking(true);
			this.loadedFile = this.sdCardFilePath;
			let fileToLoad = this.sdCardFilePath.replace('/home/pi/gcode_files/', '');
			await this.loadFile(this.apiUrl + '/server/files/gcodes/' + encodeURI(fileToLoad));
		} else {
			viewer.gcodeProcessor.setLiveTracking(false);
		}
	}

	@Watch('printerIsPrinting')
	printerIsPrintingChanged() {
		this.tracking = false;
	}

	get showCursor() {
		try {
			return this.$store.state.gui.gcodeViewer.showCursor ?? false;
		} catch {
			return false;
		}
	}

	@Watch('showCursor')
	showCursorChanged(newVal) {
		viewer.setCursorVisiblity(newVal);
	}

	get extruderColors() {
		try {
			return this.$store.state.gui.gcodeViewer.extruderColors;
		} catch {
			return false;
		}
	}

	@Watch('extruderColors')
	extruderColorsChanged(newVal) {
		if (newVal) {
			let match = true;
			let extruderColors = viewer.getExtruderColors();
			if (newVal.length === extruderColors.length) {
				for (let idx = 0; idx < extruderColors.length && match; idx++) {
					if (newVal[idx] != extruderColors[idx]) {
						match = false;
					}
				}
			}
			if (!match) {
				viewer.saveExtruderColors(newVal);
				this.setReloadRequiredFlag();
			}
		}
	}

	get colorMode() {
		try {
			return this.$store.state.gui.gcodeViewer.colorMode;
		} catch {
			return 'extruder';
		}
	}

	@Watch('colorMode')
	colorModeChanged(newVal) {
		if (newVal) {
			let mode = newVal === 'extruder' ? 0 : 1; //Magic number until I export the enum 0 = Color 1 = Feed Rate
			if (viewer.gcodeProcessor.colorMode !== mode) {
				this.setReloadRequiredFlag();
				viewer.gcodeProcessor.setColorMode(mode);
			}
		}
	}

	get backgroundColor() {
		try {
			return this.$store.state.gui.gcodeViewer.backgroundColor;
		} catch {
			return '#000000';
		}
	}

	@Watch('backgroundColor')
	backgroundColorChanged(newVal) {
		viewer.setBackgroundColor(newVal);
	}

	get gridColor() {
		try {
			return this.$store.state.gui.gcodeViewer.gridColor;
		} catch {
			return '#000000';
		}
	}

	@Watch('gridColor')
	gridColorChanged(newVal) {
		viewer.bed.setBedColor(newVal);
	}

	get showAxes() {
		try {
			return this.$store.state.gui.gcodeViewer.showAxes;
		} catch {
			return true;
		}
	}

	@Watch('showAxes')
	showAxesChanged(newVal) {
		viewer.axes.show(newVal);
	}

	get minFeed() {
		try {
			return this.$store.state.gui.gcodeViewer.minFeed;
		} catch {
			return 20;
		}
	}

	@Watch('minFeed')
	minFeedChanged(newVal) {
		viewer.gcodeProcessor.updateColorRate(newVal * 60, this.maxFeed * 60);
	}

	get maxFeed() {
		try {
			return this.$store.state.gui.gcodeViewer.maxFeed;
		} catch {
			return 100;
		}
	}

	@Watch('maxFeed')
	maxFeedChanged(newVal) {
		viewer.gcodeProcessor.updateColorRate(this.minFeed * 60, newVal * 60);
	}

	get minFeedColor() {
		try {
			return this.$store.state.gui.gcodeViewer.minFeedColor;
		} catch {
			return '#0000FF';
		}
	}

	@Watch('minFeedColor')
	minFeedColorUpdated(newVal) {
		viewer.gcodeProcessor.updateMinFeedColor(newVal);
		this.setReloadRequiredFlag();
	}

	get maxFeedColor() {
		try {
			return this.$store.state.gui.gcodeViewer.maxFeedColor;
		} catch {
			return '#FF0000';
		}
	}

	@Watch('maxFeedColor')
	maxFeedColorUpdated(newVal) {
		viewer.gcodeProcessor.updateMaxFeedColor(newVal);
		this.setReloadRequiredFlag();
	}
}
</script>

