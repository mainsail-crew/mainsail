<template>
    <v-dialog v-model="showDialog" persistent :max-width="400" @keydown.esc="closeDialog">
        <panel
            :title="$t('Heightmap.RenameBedMeshProfile')"
            :icon="mdiGrid"
            card-class="heightmap-rename-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-text-field
                    ref="input"
                    v-model="newName"
                    :label="$t('Heightmap.Name')"
                    required
                    :rules="rules"
                    @update:error="onUpdateError"
                    @keyup.enter="renameProfile" />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closeDialog">{{ $t('Buttons.Cancel') }}</v-btn>
                <v-btn :disabled="isInvalidName" color="primary" text @click="renameProfile">
                    {{ $t('Heightmap.Rename') }}
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
    name: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])

const showDialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const input = ref<FocusableRef | null>(null)

const isInvalidName = ref(false)
const newName = ref('')

const profileNames = computed(() => Object.keys(store.state.printer.bed_mesh?.profiles ?? {}))

const rules = [
    (value: string) => !!value || t('Heightmap.InvalidNameEmpty'),
    (value: string) => value !== 'default' || t('Heightmap.InvalidNameReserved'),
    (value: string) =>
        !profileNames.value.includes(value) || value === props.name || t('Heightmap.InvalidNameAlreadyExists'),

    // eslint-disable-next-line no-control-regex
    (value: string) => value === value.replace(/[^\x00-\x7F]/g, '') || t('Heightmap.InvalidNameAscii'),
]

function renameProfile() {
    if (props.name === newName.value) {
        closeDialog()
        return
    }

    const gcode = `BED_MESH_PROFILE SAVE="${newName.value}"\nBED_MESH_PROFILE REMOVE="${props.name}"`

    store.dispatch('server/addEvent', { message: gcode, type: 'command' })
    socket.emit('printer.gcode.script', { script: gcode }, { loading: 'bedMeshRename' })

    closeDialog()
}

function closeDialog() {
    showDialog.value = false
}

function onUpdateError(hasError: boolean) {
    isInvalidName.value = hasError
}

watch(showDialog, (newVal: boolean) => {
    if (!newVal) return

    newName.value = props.name

    setTimeout(() => {
        input.value?.focus()
    })
})
</script>
