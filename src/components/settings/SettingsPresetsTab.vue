<template>
    <div>
        <presets-form v-if="boolForm" :preset="formPreset" @close="boolForm = false" />
        <presets-form-cooldown
            v-else-if="boolFormCooldown"
            :input-gcode="cooldownGcode"
            @close="boolFormCooldown = false" />
        <v-card v-else flat>
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.PresetsTab.PreheatPresets') }}</h3>
                <div v-for="(preset, key) in presets" :key="preset.index">
                    <v-divider v-if="key" class="my-2" />
                    <presets-entry :preset="preset" @edit="edit" />
                </div>
                <v-divider v-if="presets.length" class="my-2" />
                <presets-entry-cooldown @edit="boolFormCooldown = true" />
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text color="primary" @click="createPreset">{{ $t('Settings.PresetsTab.AddPreset') }}</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { GuiPresetsStatePreset } from '@/store/gui/presets/types'
import { mdiDelete, mdiPencil } from '@mdi/js'
import PresetsEntry from '@/components/settings/Presets/PresetsEntry.vue'
import PresetsEntryCooldown from '@/components/settings/Presets/PresetsEntryCooldown.vue'
import PresetsForm from '@/components/settings/Presets/PresetsForm.vue'

@Component({
    components: { PresetsForm, PresetsEntryCooldown, PresetsEntry, SettingsRow },
})
export default class SettingsPresetsTab extends Mixins(BaseMixin) {
    mdiPencil = mdiPencil
    mdiDelete = mdiDelete

    boolForm = false
    boolFormCooldown = false

    formPreset: GuiPresetsStatePreset = {} as GuiPresetsStatePreset

    get presets() {
        return this.$store.getters['gui/presets/getPresets'] ?? []
    }

    get cooldownGcode() {
        return this.$store.getters['gui/presets/getCooldownGcode']
    }

    createPreset() {
        this.formPreset.id = null
        this.formPreset.name = ''
        this.formPreset.values = {}
        this.formPreset.gcode = ''

        this.boolForm = true
    }

    edit(preset: GuiPresetsStatePreset) {
        this.formPreset = { ...preset }
        this.boolForm = true
    }
}
</script>
