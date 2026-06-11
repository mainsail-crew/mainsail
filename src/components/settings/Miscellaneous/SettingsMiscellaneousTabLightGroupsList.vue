<template>
    <div>
        <v-card-text>
            <h3 class="text-h5 mb-3">{{ $t('Settings.MiscellaneousTab.LightGroups', { name }) }}</h3>
            <template v-if="groups.length">
                <div v-for="(group, index) in groups" :key="group.id">
                    <v-divider v-if="index" class="my-2" />
                    <settings-miscellaneous-tab-light-groups-list-entry
                        :type="type"
                        :name="name"
                        :group="group"
                        @edit-group="editGroup" />
                </div>
            </template>
            <p v-else class="mb-0 text-center font-italic">{{ $t('Settings.MiscellaneousTab.NoGroupFound') }}</p>
        </v-card-text>
        <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="close">{{ $t('Buttons.Close') }}</v-btn>
            <v-btn variant="text" color="primary" @click="createGroup">{{ $t('Settings.MiscellaneousTab.AddGroup') }}</v-btn>
        </v-card-actions>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { caseInsensitiveSort } from '@/plugins/helpers'
import { GuiMiscellaneousStateEntryLightgroup } from '@/store/gui/miscellaneous/types'

const props = defineProps({
    type: { type: String, required: true },
    name: { type: String, required: true },
})

const emit = defineEmits<{
    (e: 'edit-group', groupId: string): void
    (e: 'close'): void
    (e: 'create-group'): void
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

const groups = computed(() => {
    if (!entry.value) return []
    const lightgroups = entry.value.lightgroups ?? {}
    const output: GuiMiscellaneousStateEntryLightgroup[] = []
    Object.keys(lightgroups).forEach((key) => {
        output.push({
            name: lightgroups[key].name,
            start: lightgroups[key].start,
            end: lightgroups[key].end,
            id: key,
        })
    })
    return caseInsensitiveSort(output, 'name')
})

function editGroup(groupId: string) {
    emit('edit-group', groupId)
}

function close() {
    emit('close')
}

function createGroup() {
    emit('create-group')
}
</script>
