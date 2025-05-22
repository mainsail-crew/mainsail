<template>
    <div>
        <v-card-text>
            <h3 class="text-h5 mb-3">{{ $t('Settings.MiscellaneousTab.LightPresets', { name }) }}</h3>
            <template v-if="presets.length">
                <div v-for="(preset, index) in presets" :key="preset.id">
                    <v-divider v-if="index" class="my-2" />
                    <settings-miscellaneous-tab-light-presets-list-entry
                        :type="type"
                        :name="name"
                        :preset="preset"
                        @edit-preset="editPreset" />
                </div>
            </template>
            <p v-else class="mb-0 text-center font-italic">{{ $t('Settings.MiscellaneousTab.NoPresetFound') }}</p>
        </v-card-text>
        <v-card-actions>
            <v-spacer />
            <v-btn text @click="close">{{ $t('Settings.Close') }}</v-btn>
            <v-btn text color="primary" @click="createPreset">{{ $t('Settings.MiscellaneousTab.AddPreset') }}</v-btn>
        </v-card-actions>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { caseInsensitiveSort } from '@/plugins/helpers'
import { GuiMiscellaneousStateEntryPreset } from '@/store/gui/miscellaneous/types'

@Component({
    components: { SettingsRow },
})
export default class SettingsMiscellaneousTabLightPresetsList extends Mixins(BaseMixin) {
    @Prop({ type: String, required: true }) declare type: string
    @Prop({ type: String, required: true }) declare name: string

    get entry() {
        const entries = this.$store.state.gui.miscellaneous.entries ?? {}
        const key =
            Object.keys(entries).find((key) => {
                const entry = entries[key]
                return entry.type === this.type && entry.name === this.name
            }) ?? ''

        return entries[key] ?? {}
    }

    get presets() {
        if (!this.entry) return []

        const presets = this.entry.presets ?? {}

        const output: GuiMiscellaneousStateEntryPreset[] = []
        Object.keys(presets).forEach((key) => {
            const preset = presets[key]

            output.push({
                ...preset,
                id: key,
            })
        })

        return caseInsensitiveSort(output, 'name')
    }

    editPreset(presetId: string) {
        this.$emit('edit-preset', presetId)
    }

    close() {
        this.$emit('close')
    }

    createPreset() {
        this.$emit('create-preset')
    }
}
</script>
