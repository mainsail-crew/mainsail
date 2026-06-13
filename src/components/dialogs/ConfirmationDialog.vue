<template>
    <v-dialog v-model="showDialog" width="400" :fullscreen="isMobile">
        <panel card-class="confirm-top-corner-menu-dialog" :icon="iconToUse" :title="title" :margin-bottom="false">
            <template #buttons>
 <v-btn :icon="mdiCloseThick" rounded="0" @click="close"/>
            </template>
            <v-card-text>{{ text }}</v-card-text>
            <v-card-actions>
                <v-spacer />
 <v-btn variant="text" @click="close">{{ cancelButtonComputed }}</v-btn>
 <v-btn variant="text" :color="actionButtonColor" @click="action">{{ actionButtonText }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Panel from '@/components/ui/Panel.vue'
import { useBase } from '@/composables/useBase'
import { mdiAlert, mdiCloseThick } from '@mdi/js'

const { t } = useI18n()
const { isMobile } = useBase()

const props = defineProps({
    modelValue: { type: Boolean },
    title: { type: String, required: true },
    text: { type: String, required: true },
    actionButtonText: { type: String, required: true },
    cancelButtonText: { type: String, default: '' },
    actionButtonColor: { type: String, default: 'error' },
    icon: { type: String, default: null },
})
const emit = defineEmits(['update:modelValue', 'action'])

const showDialog = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const iconToUse = computed(() => props.icon ?? mdiAlert)

const cancelButtonComputed = computed(() => props.cancelButtonText || t('Buttons.Cancel').toString())

function action() {
    emit('action')
    showDialog.value = false
}

function close() {
    showDialog.value = false
}
</script>
