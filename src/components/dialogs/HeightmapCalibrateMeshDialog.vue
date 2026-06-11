<template>
    <v-dialog v-model="showDialog" persistent :max-width="400" @keydown.esc="closeDialog">
        <panel
            :title="$t('Heightmap.BedMeshCalibrate')"
            :icon="mdiGrid"
            card-class="heightmap-calibrate-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-text-field
                    ref="input"
                    v-model="name"
                    :label="$t('Heightmap.Name')"
                    required
                    :rules="rules"
                    @update:error="
                        (newVal) => {
                            isInvalidName = newVal
                        }
                    "
                    @keyup.enter="calibrateMesh" />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn :disabled="isInvalidName" color="primary" text @click="calibrateMesh">
                    {{ $t('Heightmap.Calibrate') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useSocket } from '@/composables/useSocket'
import type { FocusableRef } from '@/types/vuetify'
import { mdiCloseThick, mdiGrid } from '@mdi/js'

const store = useStore()
const { t } = useI18n()
const socket = useSocket()

const mdiCloseThick = mdiCloseThick
const mdiGrid = mdiGrid

const props = defineProps({
    modelValue: { type: Boolean },
})
const emit = defineEmits(['update:modelValue'])

const showDialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const input = ref<FocusableRef | null>(null)

const isInvalidName = ref(false)
const name = ref('')

const rules = [
    (value: string) => !!value || t('Heightmap.InvalidNameEmpty'),

    // eslint-disable-next-line no-control-regex
    (value: string) => value === value.replace(/[^\x00-\x7F]/g, '') || t('Heightmap.InvalidNameAscii'),
]

function calibrateMesh(): void {
    const gcode = `BED_MESH_CALIBRATE PROFILE="${name.value}"`

    store.dispatch('server/addEvent', { message: gcode, type: 'command' })
    socket.emit('printer.gcode.script', { script: gcode }, { loading: 'bedMeshCalibrate' })

    closeDialog()
}

function closeDialog() {
    showDialog.value = false
}

watch(showDialog, (newVal: boolean) => {
    if (!newVal) return

    name.value = 'default'
    setTimeout(() => {
        input.value?.focus()
    })
})
</script>
