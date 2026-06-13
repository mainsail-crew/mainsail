<template>
    <v-form ref="form" v-model="formValid">
        <v-card-text>
            <h3 class="text-h5 mb-3">{{ title }}</h3>
            <settings-row :title="$t('Settings.MiscellaneousTab.Name')">
                <v-text-field
                    v-model="groupname"
                    hide-details="auto"
                    :rules="[rules.required, rules.groupUnique]"
                    density="compact"
                    variant="outlined" />
            </settings-row>
            <v-divider class="my-2" />
            <settings-row
                :title="$t('Settings.MiscellaneousTab.Start')"
                :sub-title="$t('Settings.MiscellaneousTab.StartDescription')">
                <v-text-field
                    v-model="start"
                    hide-details="auto"
                    type="number"
                    :step="1"
                    :rules="[rules.required, rules.minStart, rules.max]"
                    density="compact"
                    variant="outlined"
                    @keyup="revalidateForm" />
            </settings-row>
            <v-divider class="my-2" />
            <settings-row
                :title="$t('Settings.MiscellaneousTab.End')"
                :sub-title="$t('Settings.MiscellaneousTab.EndDescription')">
                <v-text-field
                    v-model="end"
                    hide-details="auto"
                    type="number"
                    :step="1"
                    :rules="[rules.required, rules.minEnd, rules.max]"
                    density="compact"
                    variant="outlined"
                    @keyup="revalidateForm" />
            </settings-row>
        </v-card-text>
        <v-card-actions>
            <v-spacer />
 <v-btn variant="text" @click="close">{{ $t('Buttons.Cancel') }}</v-btn>
 <v-btn v-if="groupId !== null" variant="text" color="primary" :disabled="!formValid" @click="updateGroup">
                {{ $t('Settings.Update') }}
            </v-btn>
 <v-btn v-else variant="text" color="primary" :disabled="!formValid" @click="storeGroup">
                {{ $t('Settings.Store') }}
            </v-btn>
        </v-card-actions>
    </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { caseInsensitiveSort } from '@/plugins/helpers'
import { GuiMacrosStateMacrogroup } from '@/store/gui/macros/types'
import type { GuiMiscellaneousStateEntry, GuiMiscellaneousStateEntryLightgroup } from '@/store/gui/miscellaneous/types'

const props = defineProps({
    type: { type: String, default: null },
    name: { type: String, default: null },
    groupId: { type: String, default: null },
})

const emit = defineEmits<{
    (e: 'close'): void
}>()

const store = useStore()
const { t } = useI18n()
const form = ref<any>(null)
const formValid = ref(false)
const groupname = ref('')
const start = ref(1)
const end = ref(1)

const rules = computed(() => ({
    required: (value: string) => value !== '' || t('Settings.MiscellaneousTab.Required'),
    groupUnique: (value: string) =>
        !existsGroupName(value) || t('Settings.MiscellaneousTab.NameExists'),
    minStart: (value: string) => parseInt(value) > 0 || t('Settings.MiscellaneousTab.GreaterThanZero'),
    minEnd: (value: string) =>
        parseInt(value) >= start.value || t('Settings.MiscellaneousTab.HigherThanStart'),
    max: (value: string) =>
        parseInt(value) <= chainCount.value ||
        t('Settings.MiscellaneousTab.LessThanChainCount', { count: chainCount.value }),
}))

const title = computed(() => {
    if (props.groupId) return t('Settings.MiscellaneousTab.EditGroup')
    return t('Settings.MiscellaneousTab.CreateGroup')
})

const settings = computed(() => {
    if (!props.type || !props.name) return null
    const key = `${props.type.toLowerCase()} ${props.name.toLowerCase()}`
    return store.state.printer?.configfile?.settings[key] ?? {}
})

const chainCount = computed(() => settings.value?.chain_count ?? 1)

const light = computed(() => {
    if (!props.type || !props.name) return null
    const key = `${props.type} ${props.name}`
    return store.state.printer[key] ?? {}
})

const entry = computed(() => {
    const entries = store.state.gui.miscellaneous.entries ?? {}
    const key = Object.keys(entries).find((k) => {
        const entry = entries[k]
        return entry.type === props.type && entry.name === props.name
    })
    return entries[key ?? ''] ?? {}
})

const groups = computed(() => {
    if (!entry.value?.lightgroups) return []
    const output: GuiMiscellaneousStateEntryLightgroup[] = []
    Object.keys(entry.value.lightgroups).forEach((id) => {
        const lightgroup = entry.value.lightgroups[id]
        lightgroup.id = id
        output.push(lightgroup)
    })
    return caseInsensitiveSort(output, 'name')
})

const group = computed(() => {
    if (!props.groupId) return null
    return groups.value.find((g) => g.id === props.groupId) ?? null
})

watch(group, (newGroup) => {
    groupname.value = newGroup?.name ?? ''
    start.value = newGroup?.start ?? 1
    end.value = newGroup?.end ?? 1
}, { immediate: true })

function close() {
    emit('close')
}

function revalidateForm() {
    nextTick(() => {
        form.value?.validate()
    })
}

function storeGroup() {
    store.dispatch('gui/miscellaneous/storeLightgroup', {
        type: props.type,
        name: props.name,
        lightgroup: {
            name: groupname.value,
            start: parseInt(start.value.toString(), 10),
            end: parseInt(end.value.toString(), 10),
        },
    })
    close()
}

function updateGroup() {
    store.dispatch('gui/miscellaneous/updateLightgroup', {
        type: props.type,
        name: props.name,
        lightgroupId: props.groupId,
        lightgroup: {
            name: groupname.value,
            start: parseInt(start.value.toString(), 10),
            end: parseInt(end.value.toString(), 10),
        },
    })
    close()
}

function existsGroupName(name: string) {
    return (
        groups.value.findIndex(
            (g: GuiMacrosStateMacrogroup) => g.name === name && g.id !== props.groupId
        ) >= 0
    )
}
</script>
