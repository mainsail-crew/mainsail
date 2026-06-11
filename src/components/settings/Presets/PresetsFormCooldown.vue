<template>
    <v-card flat>
        <v-form @submit.prevent="saveCooldown">
            <v-card-title>{{ $t('Settings.PresetsTab.EditCooldown') }}</v-card-title>
            <v-card-text>
                <settings-row :title="$t('Settings.PresetsTab.CustomGCode')">
                    <v-textarea v-model="gcode" outlined hide-details />
                </settings-row>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text @click="closeForm">
                    {{ $t('Buttons.Cancel') }}
                </v-btn>
                <v-btn color="primary" text type="submit">
                    {{ $t('Settings.PresetsTab.UpdateCooldown') }}
                </v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

const props = defineProps({
    inputGcode: { type: String, required: true },
})

const emit = defineEmits<{
    (e: 'close'): void
}>()

const store = useStore()
const gcode = ref('')

onMounted(() => {
    gcode.value = props.inputGcode
})

function closeForm() {
    emit('close')
}

function saveCooldown() {
    store.dispatch('gui/presets/saveSetting', { name: 'cooldownGcode', value: gcode.value })
    closeForm()
}
</script>
