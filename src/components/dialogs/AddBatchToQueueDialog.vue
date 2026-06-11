<template>
    <v-dialog v-model="showDialog" :max-width="400" @click:outside="closeDialog" @keydown.esc="closeDialog">
        <panel
            :title="$t('Files.AddToQueue')"
            card-class="gcode-files-add-to-queue-dialog"
            :icon="mdiPlaylistPlus"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>

            <v-form v-model="isValid" @submit.prevent="addBatchToQueueAction">
                <v-card-text>
                    <v-text-field
                        ref="inputField"
                        v-model="input"
                        :label="$t('Files.Count')"
                        required
                        hide-spin-buttons
                        type="number"
                        :rules="rules.count">
                        <template #append-outer>
                            <div class="_spin_button_group">
                                <v-btn class="mt-n3" icon plain small @click="input++">
                                    <v-icon>{{ mdiChevronUp }}</v-icon>
                                </v-btn>
                                <v-btn :disabled="input <= 1" class="mb-n3" icon plain small @click="input--">
                                    <v-icon>{{ mdiChevronDown }}</v-icon>
                                </v-btn>
                            </div>
                        </template>
                    </v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                    <v-btn color="primary" variant="text" type="submit" :disabled="!isValid">
                        {{ $t('Files.AddToQueue') }}
                    </v-btn>
                </v-card-actions>
            </v-form>
        </panel>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { getCurrentInstance } from 'vue'
import type { FocusableRef } from '@/types/vuetify'
import { mdiChevronDown, mdiChevronUp, mdiPlaylistPlus, mdiCloseThick } from '@mdi/js'

const store = useStore()
const { t } = useI18n()
const { proxy } = getCurrentInstance()!

const props = defineProps({
    showToast: { type: Boolean, default: false },
    filename: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])

const showDialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})


const inputField = ref<FocusableRef | null>(null)

const isValid = ref(false)
const input = ref('1')

const rules = {
    count: [
        (value: string) => !!value || t('JobQueue.InvalidCountEmpty'),
        (value: string) => parseInt(value, 10) > 0 || t('JobQueue.InvalidCountGreaterZero'),
    ],
}

async function addBatchToQueueAction() {
    const array = Array(parseInt(input.value)).fill(props.filename)

    await store.dispatch('server/jobQueue/addToQueue', array)

    if (props.showToast)
        proxy!.$toast.info(t('History.AddToQueueSuccessful', { filename: props.filename }).toString())

    closeDialog()
}

function closeDialog() {
    showDialog.value = false
}

function resetFormState() {
    input.value = '1'
}

watch(showDialog, (newVal: boolean) => {
    if (!newVal) return

    resetFormState()
    setTimeout(() => {
        inputField.value?.focus()
    })
})
</script>

<style scoped>
._spin_button_group {
    width: 24px;
    margin-top: -6px;
    margin-left: -6px;
    margin-bottom: -6px;
}
</style>
