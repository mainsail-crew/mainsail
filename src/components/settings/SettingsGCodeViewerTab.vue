<template>
    <div>
        <v-card flat>
            <v-card-text>
                <settings-row :title="$t('Settings.GCodeViewerTab.ShowAxes')">
                    <v-switch class="mt-0" hide-details v-model="showAxes"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GCodeViewerTab.BackgroundColor')">
                    <v-menu :close-on-content-click="false" bottom left offset-y>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn :color="backgroundColor" class="minwidth-0 px-5" small v-bind="attrs" v-on="on"></v-btn>
                        </template>
                        <v-color-picker :value="backgroundColor" @update:color="updateColorValue('backgroundColor', $event)" hide-mode-switch mode="rgba"></v-color-picker>
                    </v-menu>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GCodeViewerTab.GridColor')">
                    <v-menu :close-on-content-click="false" bottom left offset-y>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn :color="gridColor" class="minwidth-0 px-5" small v-bind="attrs" v-on="on"></v-btn>
                        </template>
                        <v-color-picker :value="gridColor" @update:color="updateColorValue('gridColor', $event)" hide-mode-switch mode="rgba"></v-color-picker>
                    </v-menu>
                </settings-row>
                <v-divider class="my-2"></v-divider>
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
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GCodeViewerTab.MinFeed')">
                    <v-menu :close-on-content-click="false" bottom left offset-y>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn :color="minFeedColor" class="minwidth-0 px-5 mr-3" small v-bind="attrs" v-on="on"></v-btn>
                        </template>
                        <v-color-picker :value="minFeedColor" @update:color="updateColorValue('minFeedColor', $event)" hide-mode-switch mode="rgba"></v-color-picker>
                    </v-menu>
                    <v-text-field :rules="[v => v > 0 || 'Minimum speed is 1']" @blur="feedBlur" dense hide-details="auto" outlined suffix="mm/s" type="number" v-model="minFeed" hide-spin-buttons></v-text-field>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GCodeViewerTab.MaxFeed')">
                    <v-menu :close-on-content-click="false" bottom left offset-y>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn :color="maxFeedColor" class="minwidth-0 px-5 mr-3" small v-bind="attrs" v-on="on"></v-btn>
                        </template>
                        <v-color-picker :value="maxFeedColor" @update:color="updateColorValue('maxFeedColor', $event)" hide-mode-switch mode="rgba"></v-color-picker>
                    </v-menu>
                    <v-text-field :rules="[v => v > 0 || 'Minimum speed is 1']" @blur="feedBlur" dense hide-details="auto" outlined suffix="mm/s" type="number" v-model="maxFeed" hide-spin-buttons></v-text-field>
                </settings-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import {Debounce} from 'vue-debounce-decorator'
import Vue from 'vue'

@Component({
    components: {SettingsRow},
})
export default class SettingsGCodeViewerTab extends Mixins(BaseMixin) {
    get showAxes(): boolean {
        return this.$store.state.gui.gcodeViewer.showAxes
    }

    set showAxes(newVal: boolean) {
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.showAxes', value: newVal})
    }

    get extruderColors(): Array<string> {
        return this.$store.state.gui.gcodeViewer.extruderColors
    }

    @Debounce(500)
    colorsUpdated(value: any, index: number): void {
        let colors = this.extruderColors
        colors[index] = value.hex
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.extruderColors', value: colors})
    }

    get backgroundColor(): string {
        return this.$store.state.gui.gcodeViewer.backgroundColor
    }

    set backgroundColor(newVal: string) {
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.backgroundColor', value: newVal})
    }

    get gridColor(): string {
        return this.$store.state.gui.gcodeViewer.gridColor
    }

    set gridColor(newVal: string) {
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.gridColor', value: newVal})
    }

    @Debounce(500)
    updateColorValue(colorElement: string, newVal: any): void {
        Vue.set(this, colorElement, this.clearColorObject(newVal))
    }

    clearColorObject(color: any): string {
        if (typeof color === 'object' && 'hex' in color) color = color.hex
        if (color.length > 7) color = color.substr(0, 7)
        return color
    }

    get minFeed(): number {
        return this.$store.state.gui.gcodeViewer.minFeed
    }

    set minFeed(newVal: number) {
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.minFeed', value: newVal})
    }

    get maxFeed(): number {
        return this.$store.state.gui.gcodeViewer.maxFeed
    }

    set maxFeed(newVal: number) {
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.maxFeed', value: newVal})
    }

    get minFeedColor(): string {
        return this.$store.state.gui.gcodeViewer.minFeedColor
    }

    set minFeedColor(newVal: string) {
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.minFeedColor', value: newVal})
    }

    get maxFeedColor(): string {
        return this.$store.state.gui.gcodeViewer.maxFeedColor
    }

    set maxFeedColor(newVal: string) {
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.maxFeedColor', value: newVal})
    }

    feedBlur(): void {
        if (this.minFeed < 1) this.minFeed = 1
        if (this.maxFeed < this.minFeed) this.maxFeed = this.minFeed + 1
    }

    get progressColor(): string {
        return this.$store.state.gui.gcodeViewer.progressColor
    }

    set progressColor(newVal: string) {
        this.$store.dispatch('gui/saveSetting', {name: 'gcodeViewer.progressColor', value: newVal})
    }
}
</script>