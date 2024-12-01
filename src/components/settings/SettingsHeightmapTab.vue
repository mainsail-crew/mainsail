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
import { Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiGrid } from '@mdi/js'

@Component({
    components: {
        Panel,
        SettingsRow,
    },
})
export default class SettingsHeightmapTab extends Mixins(BaseMixin) {
    mdiGrid = mdiGrid

    get availableOrientations() {
        return [
            {
                text: this.$t('Settings.HeightmapTab.Orientations.RightFront'),
                value: 'rightFront',
            },
            {
                text: this.$t('Settings.HeightmapTab.Orientations.LeftFront'),
                value: 'leftFront',
            },
            {
                text: this.$t('Settings.HeightmapTab.Orientations.Front'),
                value: 'front',
            },
            {
                text: this.$t('Settings.HeightmapTab.Orientations.Top'),
                value: 'top',
            },
        ]
    }

    get defaultOrientation() {
        return this.$store.state.gui.heightmap.defaultOrientation
    }

    set defaultOrientation(newVal) {
        this.$store.dispatch('gui/heightmap/saveSetting', { name: 'defaultOrientation', value: newVal })
    }

    get availableColorSchemes() {
        return [
            {
                text:
                    this.$t('Settings.HeightmapTab.Schemes.Portland') +
                    ' ' +
                    this.$t('Settings.HeightmapTab.IsDefault'),
                value: 'portland',
            },
            {
                text: this.$t('Settings.HeightmapTab.Schemes.Spring'),
                value: 'spring',
            },
            {
                text: this.$t('Settings.HeightmapTab.Schemes.Hot'),
                value: 'hot',
            },
            {
                text: this.$t('Settings.HeightmapTab.Schemes.Hsv'),
                value: 'hsv',
            },
            {
                text: this.$t('Settings.HeightmapTab.Schemes.GrayScale'),
                value: 'grayScale',
            },
        ]
    }

    get colorScheme() {
        return this.$store.state.gui.heightmap.activecolorscheme
    }

    set colorScheme(newVal) {
        this.$store.dispatch('gui/heightmap/saveSetting', { name: 'activecolorscheme', value: newVal })
    }

    @Watch('colorScheme')
    colorSchemeChanged(newVal: number) {
        this.colorScheme = newVal
    }
}
</script>
