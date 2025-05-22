<template>
    <settings-row :title="outputName" :dynamic-slot-width="true">
        <v-btn v-if="chainCount > 1" small outlined class="ml-3" @click="openGroups">
            <v-icon left small>{{ mdiPencil }}</v-icon>
            {{ $t('Settings.MiscellaneousTab.Groups') }}
        </v-btn>
        <v-btn small outlined class="ml-3" @click="openPresets">
            <v-icon left small>{{ mdiPalette }}</v-icon>
            {{ $t('Settings.MiscellaneousTab.Presets') }}
        </v-btn>
    </settings-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiPalette, mdiPencil } from '@mdi/js'
import { convertName } from '@/plugins/helpers'
import MiscellaneousMixin from '@/components/mixins/miscellaneous'

@Component({
    components: { SettingsRow },
})
export default class SettingsMiscellaneousTabListLight extends Mixins(BaseMixin, MiscellaneousMixin) {
    mdiPalette = mdiPalette
    mdiPencil = mdiPencil

    convertName = convertName

    @Prop({ type: String, required: true }) readonly type!: string
    @Prop({ type: String, required: true }) readonly name!: string

    get outputName() {
        return this.convertName(this.name)
    }

    get settings() {
        const key = `${this.type.toLowerCase()} ${this.name.toLowerCase()}`
        const settings = this.$store.state.printer.configfile?.settings ?? {}

        return settings[key] ?? {}
    }

    get chainCount() {
        return this.settings.chain_count ?? 1
    }

    openGroups() {
        this.$emit('open-page', { page: 'groups', type: this.type, name: this.name })
    }

    openPresets() {
        this.$emit('open-page', { page: 'presets', type: this.type, name: this.name })
    }
}
</script>
