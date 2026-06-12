<template>
    <v-dialog v-model="showDialog" width="400">
        <panel :title="$t('Files.NewDirectory')" card-class="gcodefiles-new-directory-dialog" :margin-bottom="false">
            <template #buttons>
                <v-btn :icon="mdiCloseThick" tile @click="closePrompt" />
            </template>
            <v-card-text>
                <v-text-field
                    ref="inputField"
                    v-model="name"
                    :label="$t('Files.Name')"
                    required
                    :rules="nameInputRules"
                    @update:error="updateIsInvalidName"
                    @keydown.enter="createDirectoryAction" />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="closePrompt">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn
                    :disabled="isInvalidName || name.length === 0"
                    color="primary"
                    text
                    @click="createDirectoryAction">
                    {{ $t('Files.Create') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSocket } from '@/composables/useSocket'
import { useGcodeFiles } from '@/composables/useGcodeFiles'
import type { FocusableRef } from '@/types/vuetify'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick } from '@mdi/js'

const { t } = useI18n()
const socket = useSocket()
const { currentPath, existsFilename } = useGcodeFiles()

const name = ref('')
const isInvalidName = ref(false)

const props = defineProps({
    modelValue: { type: Boolean },
})
const emit = defineEmits(['update:modelValue'])

const showDialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const inputField = ref<FocusableRef | null>(null)

const nameInputRules = [
    (value: string) => !!value || t('Files.InvalidNameEmpty'),
    (value: string) => !existsFilename(value) || t('Files.InvalidNameAlreadyExists'),
]

function updateIsInvalidName(value: boolean) {
    isInvalidName.value = value
}

function createDirectoryAction() {
    socket.emit(
        'server.files.post_directory',
        { path: 'gcodes' + currentPath.value + '/' + name.value },
        { action: 'files/getCreateDir' }
    )

    closePrompt()
}

function closePrompt() {
    showDialog.value = false
}

watch(showDialog, (newVal: boolean) => {
    if (!newVal) return

    name.value = ''
    isInvalidName.value = false

    setTimeout(() => {
        inputField.value?.focus()
    })
})
</script>
