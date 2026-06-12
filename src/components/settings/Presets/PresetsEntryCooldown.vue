<template>
    <settings-row :title="$t('Settings.PresetsTab.Cooldown')">
        <v-btn size="small" variant="outlined" class="ml-3" @click="editCooldown">
            <v-icon left size="small">{{ mdiPencil }}</v-icon>
            {{ $t('Settings.Edit') }}
        </v-btn>
    </settings-row>
</template>

<script setup lang="ts">
import { mdiPencil } from '@mdi/js'

const emit = defineEmits<{
    (e: 'edit'): void
}>()

function editCooldown() {
    emit('edit')
}
</script>
