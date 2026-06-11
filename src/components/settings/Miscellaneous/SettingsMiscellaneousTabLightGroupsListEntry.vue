<template>
    <settings-row :title="group.name" :sub-title="subTitle" :dynamic-slot-width="true">
        <v-btn small variant="outlined" class="ml-3" @click="editGroup">
            <v-icon left small>{{ mdiPencil }}</v-icon>
            {{ $t('Settings.Edit') }}
        </v-btn>
        <v-btn small variant="outlined" class="ml-3 minwidth-0 px-2" color="error" @click="deleteGroup">
            <v-icon small>{{ mdiDelete }}</v-icon>
        </v-btn>
    </settings-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { mdiDelete, mdiPencil } from '@mdi/js'
import { GuiMiscellaneousStateEntryLightgroup } from '@/store/gui/miscellaneous/types'

const props = defineProps({
    type: { type: String, required: true },
    name: { type: String, required: true },
    group: { type: Object, required: true },
})

const emit = defineEmits<{
    (e: 'edit-group', groupId: string): void
}>()

const store = useStore()
const { t } = useI18n()

const subTitle = computed(() =>
    t('Settings.MiscellaneousTab.GroupSubTitle', {
        start: (props.group as GuiMiscellaneousStateEntryLightgroup).start,
        end: (props.group as GuiMiscellaneousStateEntryLightgroup).end,
    })
)

function editGroup() {
    emit('edit-group', (props.group as GuiMiscellaneousStateEntryLightgroup).id)
}

function deleteGroup() {
    store.dispatch('gui/miscellaneous/deleteLightgroup', {
        type: props.type,
        name: props.name,
        lightgroupId: (props.group as GuiMiscellaneousStateEntryLightgroup).id,
    })
}
</script>

<style scoped></style>
