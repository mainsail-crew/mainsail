<template>
    <v-row>
        <v-col class="text-center py-0">
            <macro-prompt-button
                v-for="(button, index) in children"
                :key="'prompt_' + groupIndex + '_' + index"
                :event="button" />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { ServerStateEventPrompt } from '@/store/server/types'

defineProps({
    children: { type: Array as () => ServerStateEventPrompt[], required: true },
    groupIndex: { type: Number, required: true },
})
</script>
