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

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { GuiPresetsStatePreset } from '@/store/gui/presets/types'
import { convertName } from '@/plugins/helpers'
import { mdiDelete, mdiPencil } from '@mdi/js'

const props = defineProps({
    preset: { type: Object, required: true },
})

const emit = defineEmits<{
    (e: 'edit', preset: GuiPresetsStatePreset): void
}>()

const store = useStore()
const { t } = useI18n()

const subTitle = computed(() => {
    const output: string[] = []
    const p = props.preset as GuiPresetsStatePreset

    Object.keys(p.values).forEach((key: string) => {
        const values = p.values[key]
        if (values.bool) {
            const name = key.indexOf(' ') ? key.slice(key.indexOf(' ') + 1) : key
            output.push(convertName(name) + ': ' + values.value + '°C')
        }
    })

    if (p.gcode) output.push(t('Settings.PresetsTab.CustomGCode').toString())
    return output.join(', ')
})

function editPreset() {
    emit('edit', props.preset as GuiPresetsStatePreset)
}

function deletePreset() {
    store.dispatch('gui/presets/delete', (props.preset as GuiPresetsStatePreset).id)
}
</script>
