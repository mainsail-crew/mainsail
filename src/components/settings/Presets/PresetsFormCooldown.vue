<template>
    <v-card flat>
        <v-form @submit.prevent="saveCooldown">
            <v-card-title>{{ $t('Settings.PresetsTab.EditCooldown') }}</v-card-title>
            <v-card-text>
                <settings-row :title="$t('Settings.PresetsTab.CustomGCode')">
                    <v-textarea v-model="gcode" outlined hide-details />
                </settings-row>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text @click="closeForm">
                    {{ $t('Settings.Cancel') }}
                </v-btn>
                <v-btn color="primary" text type="submit">
                    {{ $t('Settings.PresetsTab.UpdateCooldown') }}
                </v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiDelete, mdiPencil } from '@mdi/js'

@Component({
    components: { SettingsRow },
})
export default class PresetsFormCooldown extends Mixins(BaseMixin) {
    mdiPencil = mdiPencil
    mdiDelete = mdiDelete

    @Prop({ required: true }) readonly inputGcode!: string

    gcode = ''

    mounted() {
        this.gcode = this.inputGcode
    }

    closeForm() {
        this.$emit('close')
    }

    saveCooldown() {
        this.$store.dispatch('gui/presets/saveSetting', { name: 'cooldownGcode', value: this.gcode })
        this.closeForm()
    }
}
</script>
