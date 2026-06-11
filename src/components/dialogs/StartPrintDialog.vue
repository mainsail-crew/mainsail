<template>
    <v-dialog
        v-model="showDialog"
        :max-width="400"
        content-class="overflow-x-hidden"
        @click:outside="closeDialog"
        @keydown.esc="closeDialog">
        <v-card>
            <start-print-dialog-thumbnail :file="file" :current-path="currentPath" />
            <v-card-title class="text-h5">{{ $t('Dialogs.StartPrint.Headline') }}</v-card-title>
            <v-card-text class="pb-0">
                <p class="body-2">
                    {{ question }}
                </p>
            </v-card-text>
            <v-divider v-if="showDivider" class="my-0" />
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn
                    color="primary" variant="text" :disabled="printerIsPrinting || !klipperReadyForGui"
                    @click="startPrint(file.filename)">
                    {{ $t('Dialogs.StartPrint.Print') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSocket } from '@/composables/useSocket'
import { useBase } from '@/composables/useBase'
import type { FileStateGcodefile } from '@/store/files/types'

const { t } = useI18n()
const socket = useSocket()
const { klipperReadyForGui, printerIsPrinting, moonrakerComponents } = useBase()

const props = defineProps({
    modelValue: { type: Boolean },
    currentPath: { type: String, default: '' },
    file: { type: Object as () => FileStateGcodefile, required: true },
})
const emit = defineEmits(['update:modelValue'])

const showDialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const existsTimelapse = computed(() => moonrakerComponents.value.includes('timelapse'))

const showDivider = computed(() => existsTimelapse.value)

const question = computed(() =>
    t('Dialogs.StartPrint.DoYouWantToStartFilename', { filename: props.file?.filename ?? 'unknown' })
)

function startPrint(filename = '') {
    filename = (props.currentPath + '/' + filename).substring(1)
    closeDialog()
    socket.emit('printer.print.start', { filename: filename }, { action: 'switchToDashboard' })
}

function closeDialog() {
    showDialog.value = false
}
</script>
