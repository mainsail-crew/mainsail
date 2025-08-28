<template>
    <settings-row :title="preset.name" :sub-title="subTitle" :dynamic-slot-width="true">
        <v-btn small outlined class="ml-3" @click="editPreset">
            <v-icon left small>{{ mdiPencil }}</v-icon>
            {{ $t('Settings.Edit') }}
        </v-btn>
        <v-btn small outlined class="ml-3 minwidth-0 px-2" color="error" @click="deletePreset">
            <v-icon small>{{ mdiDelete }}</v-icon>
        </v-btn>
    </settings-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiDelete, mdiPencil } from '@mdi/js'
import { GuiMiscellaneousStateEntryPreset } from '@/store/gui/miscellaneous/types'

@Component({
    components: { SettingsRow },
})
export default class SettingsMiscellaneousTabLightPresetsListEntry extends Mixins(BaseMixin) {
    mdiDelete = mdiDelete
    mdiPencil = mdiPencil

    @Prop({ type: String, required: true }) declare type: string
    @Prop({ type: String, required: true }) declare name: string
    @Prop({ type: Object, required: true }) declare preset: GuiMiscellaneousStateEntryPreset

    get settings() {
        if (!this.type || !this.name) return null

        const key = `${this.type.toLowerCase()} ${this.name.toLowerCase()}`
        return this.$store.state.printer?.configfile?.settings[key] ?? {}
    }

    get colorOrder() {
        if (this.type?.toLowerCase() === 'led') {
            let colorOrder = ''
            if ('red_pin' in this.settings) colorOrder += 'R'
            if ('green_pin' in this.settings) colorOrder += 'G'
            if ('blue_pin' in this.settings) colorOrder += 'B'
            if ('white_pin' in this.settings) colorOrder += 'W'

            return colorOrder
        }

        // is array
        if (Array.isArray(this.settings.color_order)) {
            return this.settings.color_order[0] ?? ''
        }

        return this.settings.color_order ?? ''
    }

    get subTitle() {
        let output: string[] = []

        if (this.colorOrder.includes('R')) output.push(`R: ${this.preset.red}`)
        if (this.colorOrder.includes('G')) output.push(`G: ${this.preset.green}`)
        if (this.colorOrder.includes('B')) output.push(`B: ${this.preset.blue}`)
        if (this.colorOrder.includes('W')) output.push(`W: ${this.preset.white}`)

        return output.join(', ')
    }

    editPreset() {
        this.$emit('edit-preset', this.preset.id)
    }

    deletePreset() {
        this.$store.dispatch('gui/miscellaneous/deletePreset', {
            type: this.type,
            name: this.name,
            presetId: this.preset.id,
        })
    }
}
</script>
