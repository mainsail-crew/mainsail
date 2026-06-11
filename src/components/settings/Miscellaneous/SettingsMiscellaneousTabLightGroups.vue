<template>
    <settings-miscellaneous-tab-light-groups-form
        v-if="page === 'form'"
        :type="type"
        :name="name"
        :group-id="groupId"
        @close="openPage('')" />
    <settings-miscellaneous-tab-light-groups-list
        v-else
        :type="type"
        :name="name"
        @create-group="openPage('form')"
        @edit-group="editGroup"
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
const groupId = ref<string | null>(null)

function editGroup(id: string) {
    openPage('form')
    groupId.value = id
}

function openPage(name: string) {
    page.value = name
    groupId.value = null
}

function close() {
    emit('close')
}
</script>
