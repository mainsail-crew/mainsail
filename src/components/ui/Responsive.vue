<template>
    <div>
        <div v-if="!noHide && !init" style="visibility: hidden">
            <slot :el="el"></slot>
        </div>

        <slot :el="el"></slot>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useResponsive } from '@/composables/useResponsive'

const props = defineProps({
    noHide: { type: Boolean, default: false },
    breakpoints: { type: Object, default: undefined },
})

const { el, targetRef } = useResponsive(props.breakpoints)

const init = ref(false)

onMounted(() => {
    init.value = true
})
</script>
