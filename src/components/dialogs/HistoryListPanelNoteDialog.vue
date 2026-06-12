<template>
    <v-dialog v-model="showDialog" :max-width="600" persistent @keydown.esc="closeDialog">
        <panel :title="panelTitle" :icon="icon" card-class="history-note-dialog" :margin-bottom="false">
            <template #buttons>
                <v-btn :icon="mdiCloseThick" tile @click="closeDialog" />
            </template>
            <v-card-text class="pb-0">
                <v-row>
                    <v-col>
                        <v-textarea v-model="note" variant="outlined" hide-details :label="$t('History.Note')" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn color="primary" variant="text" @click="saveNote">{{ $t('Buttons.Save') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import Panel from '@/components/ui/Panel.vue'
import type { ServerHistoryStateJob } from '@/store/server/history/types'
import { mdiCloseThick, mdiNoteEditOutline, mdiNotePlusOutline } from '@mdi/js'

const store = useStore()
const { t } = useI18n()

const note = ref('')

const props = defineProps({
    modelValue: { type: Boolean },
    type: { type: String, required: true },
    job: { type: Object as () => ServerHistoryStateJob, required: true },
})
const emit = defineEmits(['update:modelValue'])

const showDialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const panelTitle = computed(() => {
    if (props.type === 'create') return t('History.CreateNote').toString()

    return t('History.EditNote').toString()
})

const icon = computed(() => {
    if (props.type === 'create') return mdiNotePlusOutline

    return mdiNoteEditOutline
})

function saveNote() {
    store.dispatch('server/history/saveHistoryNote', {
        job_id: props.job?.job_id,
        note: note.value,
    })

    closeDialog()
}

function closeDialog() {
    showDialog.value = false
}

watch(showDialog, (newVal: boolean) => {
    if (!newVal) return

    note.value = props.job.note ?? ''
})
</script>

<style scoped>
:deep(.os-content) .row:first-child {
    margin-top: 1em !important;
}

:deep(.os-content) .row:last-child {
    margin-bottom: 1em !important;
}
</style>
