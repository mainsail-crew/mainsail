<template>
    <v-dialog v-model="showDialog" max-width="400">
        <panel
            :title="$t('JobQueue.ChangeCount')"
            :icon="mdiCounter"
            card-class="jobqueue-change-count-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn :icon="mdiCloseThick" tile @click="closeDialog" />
            </template>

            <v-card-text>
                <v-text-field
                    ref="inputField"
                    v-model="count"
                    :label="$t('JobQueue.Count')"
                    required
                    :rules="countInputRules"
                    hide-spin-buttons
                    type="number"
                    @keyup.enter="update">
                    <template #append-outer>
                        <div class="_spin_button_group">
                            <v-btn class="mt-n3" :icon="mdiChevronUp" plain small @click="count++" />
                            <v-btn :disabled="count <= 1" class="mb-n3" :icon="mdiChevronDown" plain small @click="count--" />
                        </div>
                    </template>
                </v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn color="primary" variant="text" @click="update">{{ $t('JobQueue.ChangeCount') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import type { FocusableRef } from '@/types/vuetify'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiChevronUp, mdiChevronDown, mdiCounter } from '@mdi/js'
import type { ServerJobQueueStateJob } from '@/store/server/jobQueue/types'

const store = useStore()
const { t } = useI18n()

const props = defineProps({
    modelValue: { type: Boolean },
    job: { type: Object as () => ServerJobQueueStateJob, required: true },
})
const emit = defineEmits(['update:modelValue'])

const showDialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const inputField = ref<FocusableRef | null>(null)

const count = ref(1)

const countInputRules = [
    (value: string) => !!value || t('JobQueue.InvalidCountEmpty'),
    (value: string) => parseInt(value) > 0 || t('JobQueue.InvalidCountGreaterZero'),
]

function update() {
    store.dispatch('server/jobQueue/changeCount', {
        job_id: props.job.job_id,
        count: count.value,
    })

    closeDialog()
}

function closeDialog() {
    showDialog.value = false
}

watch(showDialog, (newVal: boolean) => {
    if (!newVal) return

    count.value = (props.job.combinedIds?.length ?? 0) + 1
    setTimeout(() => {
        inputField.value?.focus()
    })
})
</script>
