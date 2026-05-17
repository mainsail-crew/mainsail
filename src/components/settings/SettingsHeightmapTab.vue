<template>
    <div>
        <v-card flat>
            <v-card-text>
                <div class="d-flex align-center">
                    <v-icon style="opacity: 0.7">{{ mdiGrid }}</v-icon>
                    <v-card-title class="mx-n2">
                        {{ $t('Settings.HeightmapTab.Heightmap') }}
                    </v-card-title>
                    <v-divider class="ml-3" />
                </div>
                <settings-row
                    :title="$t('Settings.HeightmapTab.DefaultOrientation')"
                    :sub-title="$t('Settings.HeightmapTab.DefaultOrientationDescription')">
                    <v-select v-model="defaultOrientation" :items="availableOrientations" hide-details outlined dense />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.HeightmapTab.ColorSchemes')">
                    <v-select v-model="colorScheme" :items="availableColorSchemes" hide-details outlined dense />
                </settings-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiGrid } from '@mdi/js'
import { COLOR_SCHEMES, ORIENTATIONS } from '@/store/gui/heightmap/types'
import { capitalize } from '@/plugins/helpers'

@Component({
    components: {
        Panel,
        SettingsRow,
    },
})
export default class SettingsHeightmapTab extends Mixins(BaseMixin) {
    mdiGrid = mdiGrid

    get availableOrientations() {
        return ORIENTATIONS.map((orientation) => {
            let text = this.$t(`Settings.HeightmapTab.Orientations.${capitalize(orientation)}`)
            if (orientation === 'rightFront') text += ` ${this.$t('Settings.HeightmapTab.IsDefault')}`

            return {
                text,
                value: orientation,
            }
        })
    }

    get defaultOrientation() {
        return this.$store.state.gui.heightmap.defaultOrientation
    }

    set defaultOrientation(newVal) {
        this.$store.dispatch('gui/heightmap/saveSetting', { name: 'defaultOrientation', value: newVal })
    }

    get availableColorSchemes() {
        return COLOR_SCHEMES.map((scheme) => {
            let text = this.$t(`Settings.HeightmapTab.Schemes.${capitalize(scheme)}`)
            if (scheme === 'portland') text += ` ${this.$t('Settings.HeightmapTab.IsDefault')}`

            return {
                text,
                value: scheme,
            }
        })
    }

    get colorScheme() {
        return this.$store.state.gui.heightmap.activecolorscheme
    }

    set colorScheme(newVal) {
        this.$store.dispatch('gui/heightmap/saveSetting', { name: 'activecolorscheme', value: newVal })
    }
}
</script>
