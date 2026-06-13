<template>
    <settings-row :title="outputName" :dynamic-slot-width="true">
 <v-btn v-if="chainCount> 1" size="small" variant="outlined" class="ml-3" @click="openGroups">
            <v-icon start size="small">{{ mdiPencil }}</v-icon>
            {{ $t('Settings.MiscellaneousTab.Groups') }}
        </v-btn>
 <v-btn size="small" variant="outlined" class="ml-3" @click="openPresets">
            <v-icon start size="small">{{ mdiPalette }}</v-icon>
            {{ $t('Settings.MiscellaneousTab.Presets') }}
        </v-btn>
    </settings-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiPalette, mdiPencil } from '@mdi/js'
import { convertName } from '@/plugins/helpers'

const props = defineProps({
    type: { type: String, required: true },
    name: { type: String, required: true },
})

const emit = defineEmits<{
    (e: 'open-page', payload: { page: string; type: string; name: string }): void
}>()

const store = useStore()

const outputName = computed(() => convertName(props.name))

const settings = computed(() => {
    const key = `${props.type.toLowerCase()} ${props.name.toLowerCase()}`
    const printerSettings = store.state.printer.configfile?.settings ?? {}
    return printerSettings[key] ?? {}
})

const chainCount = computed(() => settings.value.chain_count ?? 1)

function openGroups() {
    emit('open-page', { page: 'groups', type: props.type, name: props.name })
}

function openPresets() {
    emit('open-page', { page: 'presets', type: props.type, name: props.name })
}
</script>
