<template>
	<div>
		<v-card flat>
			<v-card-text>
				<settings-row :title="$t('Settings.GCodeViewerTab.ShowCursor')">
					<v-switch class="mt-0" hide-details v-model="showCursor"></v-switch>
				</settings-row>

				<settings-row :title="$t('Settings.GCodeViewerTab.ExtruderColor')">
					<v-row no-gutters>
						<v-menu :close-on-content-click="false" :key="index" bottom left offset-y v-for="(extruderColor, index) in extruderColors">
							<template v-slot:activator="{ on, attrs }">
								<v-col align="right" class="mt-1" cols="12">
									<span class="mr-2">{{index}}</span>
									<v-btn :color="extruderColors[index]" class="minwidth-0 px-5" small v-bind="attrs" v-on="on"></v-btn>
								</v-col>
							</template>
							<v-color-picker :value="extruderColors[index]" @update:color="colorsUpdated($event, index)" hide-mode-switch mode="rgba"></v-color-picker>
						</v-menu>
					</v-row>
				</settings-row>
			</v-card-text>
		</v-card>
	</div>
</template>

<script lang="ts">
import {Component, Mixins, Watch} from 'vue-property-decorator';
import BaseMixin from '@/components/mixins/base';
import SettingsRow from '@/components/settings/SettingsRow.vue';
import {Debounce} from 'vue-debounce-decorator';
@Component({
	components: {SettingsRow},
})
export default class SettingsGCodeViewerTab extends Mixins(BaseMixin) {
	get showCursor(): boolean {
		return this.$store.state.gui.gcodeViewer.showCursor;
	}

	set showCursor(newVal: boolean) {
		this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.showCursor', value: newVal});
	}

	get extruderColors(): Array<string> {
		return this.$store.state.gui.gcodeViewer.extruderColors;
	}

	@Debounce(500)
	colorsUpdated(value: any, index: number): void {
		let colors = this.extruderColors;
		colors[index] = value.hex;
		this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.extruderColors', value: colors});
		console.log('saved');
	}
}
</script>

<style>
</style>