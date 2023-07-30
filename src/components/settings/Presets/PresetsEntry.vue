<template>
    <settings-row :title="preset.name" :sub-title="subTitle">
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
import { GuiPresetsStatePreset } from '@/store/gui/presets/types'
import { convertName } from '@/plugins/helpers'
import { mdiDelete, mdiPencil } from '@mdi/js'

@Component({
    components: { SettingsRow },
})
export default class PresetsEntry extends Mixins(BaseMixin) {
    mdiPencil = mdiPencil
    mdiDelete = mdiDelete

    @Prop({ required: true }) readonly preset!: GuiPresetsStatePreset

    get subTitle() {
        let output: string[] = []

        Object.keys(this.preset.values).forEach((key: string) => {
            const values = this.preset.values[key]

            if (values.bool) {
                const name = key.indexOf(' ') ? key.slice(key.indexOf(' ') + 1) : key

                output.push(convertName(name) + ': ' + values.value + '°C')
            }
        })

        if (this.preset.gcode) output.push(this.$t('Settings.PresetsTab.CustomGCode').toString())

        return output.join(', ')
    }

    editPreset() {
        this.$emit('edit', this.preset)
    }

    deletePreset() {
        this.$store.dispatch('gui/presets/delete', this.preset.id)
    }
}
</script>
