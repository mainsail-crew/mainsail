<template>
    <v-card flat>
        <v-form v-model="valid" @submit.prevent="savePreset">
            <v-card-title>{{ title }}</v-card-title>
            <v-card-text>
                <v-row v-if="boolInvalidMin" class="mt-3">
                    <v-col class="py-0">
                        <v-alert dense text type="error">{{ $t('Settings.PresetsTab.PresetInfo') }}</v-alert>
                    </v-col>
                </v-row>
                <settings-row :title="$t('Settings.PresetsTab.Name')">
                    <v-text-field
                        v-model="preset.name"
                        :placeholder="$t('Settings.PresetsTab.PresetNamePlaceholder')"
                        hide-details="auto"
                        :rules="[rules.required, rules.unique]"
                        dense
                        outlined />
                </settings-row>
                <div v-for="(value, key) of preset.values" :key="key">
                    <v-divider class="my-2" />
                    <settings-row :title="converNameObject(key)">
                        <v-checkbox v-model="value.bool" hide-details class="shrink mt-0" />
                        <v-text-field
                            v-model="value.value"
                            hide-details="auto"
                            :rules="[rules.invalid]"
                            type="number"
                            suffix="°C"
                            dense
                            outlined
                            hide-spin-buttons
                            @focus="$event.target.select()" />
                    </settings-row>
                </div>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.PresetsTab.CustomGCode')">
                    <v-textarea v-model="preset.gcode" outlined hide-details />
                </settings-row>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text @click="closeForm">
                    {{ $t('Settings.Cancel') }}
                </v-btn>
                <v-btn color="primary" text type="submit" :disabled="!valid">
                    {{ storeButtonText }}
                </v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
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
export default class PresetsForm extends Mixins(BaseMixin) {
    mdiPencil = mdiPencil
    mdiDelete = mdiDelete

    @Prop({ required: true }) readonly preset!: GuiPresetsStatePreset

    valid = false
    boolInvalidMin = false

    private rules = {
        required: (value: string) => value !== '' || this.$t('Settings.PresetsTab.ErrorNameRequired'),
        unique: (value: string) => !this.existsPresetName(value) || this.$t('Settings.PresetsTab.ErrorNameNotUnique'),
        invalid: (value: string) => parseFloat(value) >= 0 || this.$t('Settings.PresetsTab.ErrorInvalidValue'),
    }

    get title() {
        if (this.preset.id === null) return this.$t('Settings.PresetsTab.CreateHeadline')

        return this.$t('Settings.PresetsTab.EditHeadline')
    }

    get storeButtonText() {
        if (this.preset.id === null) return this.$t('Settings.PresetsTab.StoreButton')

        return this.$t('Settings.PresetsTab.UpdateButton')
    }

    get presets() {
        return this.$store.getters['gui/presets/getPresets'] ?? []
    }

    get available_heaters() {
        return (this.$store.state.printer?.heaters?.available_heaters ?? []).sort()
    }

    get available_temperature_fans() {
        return (this.$store.state.printer?.heaters?.available_sensors ?? [])
            .filter((name: string) => name.startsWith('temperature_fan '))
            .sort()
    }

    mounted() {
        const presetValues = Object.keys(this.preset.values)

        // add missing heaters to preset
        this.available_heaters
            .filter((name: string) => !presetValues.includes(name))
            .forEach((name: string) => {
                this.preset.values[name] = {
                    bool: false,
                    type: 'heater',
                    value: 0,
                }
            })

        // add missing temperature_fans to preset
        this.available_temperature_fans
            .filter((name: string) => !presetValues.includes(name))
            .forEach((name: string) => {
                this.preset.values[name] = {
                    bool: false,
                    type: 'temperature_fan',
                    value: 0,
                }
            })

        // remove unused values from preset
        presetValues
            .filter(
                (name: string) =>
                    !this.available_heaters.includes(name) && !this.available_temperature_fans.includes(name)
            )
            .forEach((name) => {
                delete this.preset.values[name]
            })
    }

    existsPresetName(name: string) {
        return (
            this.presets.findIndex(
                (preset: GuiPresetsStatePreset) => preset.name === name && preset.id !== this.preset.id
            ) !== -1
        )
    }

    converNameObject(name: string) {
        return convertName(name.replace('temperature_fan ', ''))
    }

    closeForm() {
        this.$emit('close')
    }

    savePreset() {
        let setValues = 0
        for (const key of Object.keys(this.preset.values)) {
            if (this.preset.values[key].bool) setValues++
        }
        if (this.preset.gcode.length) setValues++

        // stop here, when no values are set
        if (setValues === 0) {
            this.boolInvalidMin = true
            return
        }

        // create new preset, if id === null
        if (this.preset.id === null) {
            this.$store.dispatch('gui/presets/store', { values: this.preset })
            this.closeForm()
            return
        }

        // update existing preset
        this.$store.dispatch('gui/presets/update', { id: this.preset.id, values: this.preset })
        this.closeForm()
    }
}
</script>
