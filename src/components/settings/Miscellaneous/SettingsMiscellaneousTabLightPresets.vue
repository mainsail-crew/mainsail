<template>
    <settings-miscellaneous-tab-light-presets-form
        v-if="page === 'form'"
        :type="type"
        :name="name"
        :preset-id="presetId"
        @close="openPage('')" />
    <settings-miscellaneous-tab-light-presets-list
        v-else
        :type="type"
        :name="name"
        @create-preset="openPage('form')"
        @edit-preset="editPreset"
        @close="close" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps({
    type: { type: String, required: true },
    name: { type: String, required: true },
})

const emit = defineEmits<{
    (e: 'close'): void
}>()

const page = ref('')
const presetId = ref<string | null>(null)

function editPreset(id: string) {
    openPage('form')
    presetId.value = id
}

function openPage(name: string) {
    page.value = name
    presetId.value = null
}

function close() {
    emit('close')
}
</script>
