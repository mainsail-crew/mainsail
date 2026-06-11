<template>
    <v-row>
        <v-col>
            <p class="mb-0">{{ text }}</p>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ServerStateEventPromptContent } from '@/store/server/types'

const props = defineProps({
    event: { type: Object as () => ServerStateEventPromptContent, required: true },
})

const text = computed(() => props.event.message)
</script>
