<template>
    <settings-row :title="preset.name" :sub-title="subTitle" :dynamic-slot-width="true">
        <v-btn small variant="outlined" class="ml-3" @click="editPreset">
            <v-icon left small>{{ mdiPencil }}</v-icon>
            {{ $t('Settings.Edit') }}
        </v-btn>
        <v-btn small variant="outlined" class="ml-3 minwidth-0 px-2" color="error" @click="deletePreset">
            <v-icon small>{{ mdiDelete }}</v-icon>
        </v-btn>
    </settings-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { mdiDelete, mdiPencil } from '@mdi/js'
import { GuiMiscellaneousStateEntryPreset } from '@/store/gui/miscellaneous/types'

const props = defineProps({
    type: { type: String, required: true },
    name: { type: String, required: true },
    preset: { type: Object, required: true },
})

const emit = defineEmits<{
    (e: 'edit-preset', presetId: string): void
}>()

const store = useStore()

const settings = computed(() => {
    if (!props.type || !props.name) return null
    const key = `${props.type.toLowerCase()} ${props.name.toLowerCase()}`
    return store.state.printer?.configfile?.settings[key] ?? {}
})

const colorOrder = computed(() => {
    if (props.type?.toLowerCase() === 'led') {
        let order = ''
        if ('red_pin' in settings.value) order += 'R'
        if ('green_pin' in settings.value) order += 'G'
        if ('blue_pin' in settings.value) order += 'B'
        if ('white_pin' in settings.value) order += 'W'
        return order
    }
    if (Array.isArray(settings.value.color_order)) {
        return settings.value.color_order[0] ?? ''
    }
    return settings.value.color_order ?? ''
})

const subTitle = computed(() => {
    const output: string[] = []
    const p = props.preset as GuiMiscellaneousStateEntryPreset
    if (colorOrder.value.includes('R')) output.push(`R: ${p.red}`)
    if (colorOrder.value.includes('G')) output.push(`G: ${p.green}`)
    if (colorOrder.value.includes('B')) output.push(`B: ${p.blue}`)
    if (colorOrder.value.includes('W')) output.push(`W: ${p.white}`)
    return output.join(', ')
})

function editPreset() {
    emit('edit-preset', (props.preset as GuiMiscellaneousStateEntryPreset).id)
}

function deletePreset() {
    store.dispatch('gui/miscellaneous/deletePreset', {
        type: props.type,
        name: props.name,
        presetId: (props.preset as GuiMiscellaneousStateEntryPreset).id,
    })
}
</script>
