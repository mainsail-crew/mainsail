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
            <v-btn variant="text" @click="close">{{ $t('Buttons.Close') }}</v-btn>
            <v-btn variant="text" color="primary" @click="createPreset">{{ $t('Settings.MiscellaneousTab.AddPreset') }}</v-btn>
        </v-card-actions>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { caseInsensitiveSort } from '@/plugins/helpers'
import type { GuiMiscellaneousStateEntryPreset } from '@/store/gui/miscellaneous/types'

const props = defineProps({
    type: { type: String, required: true },
    name: { type: String, required: true },
})

const emit = defineEmits<{
    (e: 'edit-preset', presetId: string): void
    (e: 'close'): void
    (e: 'create-preset'): void
}>()

const store = useStore()

const entry = computed(() => {
    const entries = store.state.gui.miscellaneous.entries ?? {}
    const key =
        Object.keys(entries).find((k) => {
            const entry = entries[k]
            return entry.type === props.type && entry.name === props.name
        }) ?? ''
    return entries[key] ?? {}
})

const presets = computed(() => {
    if (!entry.value) return []
    const presets = entry.value.presets ?? {}
    const output: GuiMiscellaneousStateEntryPreset[] = []
    Object.keys(presets).forEach((key) => {
        const preset = presets[key]
        output.push({ ...preset, id: key })
    })
    return caseInsensitiveSort(output, 'name')
})

function editPreset(presetId: string) {
    emit('edit-preset', presetId)
}

function close() {
    emit('close')
}

function createPreset() {
    emit('create-preset')
}
</script>
