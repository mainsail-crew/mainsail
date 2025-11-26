<template>
    <v-card-text>
        <h3 class="text-h5 mb-3">{{ $t('Settings.MiscellaneousTab.Miscellaneous') }}</h3>
        <template v-if="filteredLights.length">
            <template v-for="(light, index) in filteredLights">
                <v-divider v-if="index" :key="'divider_' + index" class="my-2" />
                <settings-miscellaneous-tab-list-light
                    :key="index"
                    :type="light.type"
                    :name="light.name"
                    @open-page="openPage" />
            </template>
        </template>
        <p v-else class="mb-0 text-center font-italic">{{ $t('Settings.MiscellaneousTab.NoDevicesFound') }}</p>
    </v-card-text>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import MiscellaneousMixin from '@/components/mixins/miscellaneous'
import SettingsMiscellaneousTabListLight from '@/components/settings/Miscellaneous/SettingsMiscellaneousTabListLight.vue'

@Component({
    components: { SettingsMiscellaneousTabListLight },
})
export default class SettingsMiscellaneousTabList extends Mixins(BaseMixin, MiscellaneousMixin) {
    get settings() {
        return this.$store.state.printer.configfile?.settings ?? {}
    }

    get lightsWithSettings() {
        return this.lights.map((light: { type: string; name: string }) => {
            const key = `${light.type.toLowerCase()} ${light.name.toLowerCase()}`
            const config = this.settings[key] ?? {}
            let colorOrder = config?.color_order ?? ''

            if (light.type.toLowerCase() === 'led') {
                if ('red_pin' in config) colorOrder += 'R'
                if ('green_pin' in config) colorOrder += 'G'
                if ('blue_pin' in config) colorOrder += 'B'
                if ('white_pin' in config) colorOrder += 'W'
            }

            return {
                ...light,
                colorOrder: colorOrder,
            }
        })
    }

    get filteredLights() {
        return this.lightsWithSettings.filter(
            (light: { type: string; name: string; colorOrder: string }) => light.colorOrder.length > 0
        )
    }

    openPage(payload: { page: string; type: string; name: string }) {
        this.$emit('open-page', payload)
    }
}
</script>
