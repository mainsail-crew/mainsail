<template>
    <div>
        <v-card flat>
            <v-card-text>
                <settings-row :title="$t('Settings.TimelapseTab.Mode')">
                    <v-select v-model="mode" :items="modeOptions" hide-details outlined dense></v-select>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.TimelapseTab.Autorender')" :dynamic-slot-width="true">
                    <v-switch v-model="autorender" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.TimelapseTab.SaveFrames')" :dynamic-slot-width="true">
                    <v-switch v-model="saveFrames" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.TimelapseTab.GcodeVerbose')" :dynamic-slot-width="true">
                    <v-switch v-model="gcode_verbose" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.TimelapseTab.Parkhead')" :dynamic-slot-width="true">
                    <v-switch v-model="parkhead" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.TimelapseTab.Parkpos')" :dynamic-slot-width="true">
                    <v-select v-model="parkpos" :items="parkposOptions" hide-details outlined dense></v-select>
                </settings-row>
                <v-divider class="my-2"></v-divider>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">

import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
@Component({
    components: {SettingsRow}
})
export default class SettingsTimelapseTab extends Mixins(BaseMixin) {
    private modeOptions = [
        {
            text: 'layermacro',
            value: 'layermacro'
        },
        {
            text: 'hyperlapse',
            value: 'hyperlapse'
        }
    ]
    private parkposOptions = [
        {
            text: 'center',
            value: 'center'
        },
        {
            text: 'front_left',
            value: 'front_left'
        },
        {
            text: 'front_right',
            value: 'front_right'
        },
        {
            text: 'back_left',
            value: 'back_left'
        },
        {
            text: 'back_right',
            value: 'back_right'
        },
        {
            text: 'custom',
            value: 'custom'
        }
    ]

    get mode() {
        return this.$store.state.server.timelapse.settings.mode
    }

    set mode(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { mode: newVal })
    }

    get autorender() {
        return this.$store.state.server.timelapse.settings.autorender
    }

    set autorender(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { autorender: newVal })
    }

    get saveFrames() {
        return this.$store.state.server.timelapse.settings.saveFrames
    }

    set saveFrames(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { saveFrames: newVal })
    }

    get gcode_verbose() {
        return this.$store.state.server.timelapse.settings.gcode_verbose
    }

    set gcode_verbose(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { gcode_verbose: newVal })
    }

    get parkhead() {
        return this.$store.state.server.timelapse.settings.parkhead
    }

    set parkhead(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { parkhead: newVal })
    }

    get parkpos() {
        return this.$store.state.server.timelapse.settings.parkpos
    }

    set parkpos(newVal) {
        this.$store.dispatch('server/timelapse/saveSetting', { parkpos: newVal })
    }
}
</script>