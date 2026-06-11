<style scoped>
.btn-collapsible > * {
    will-change: transform;
    transition: transform 500ms;
}

.icon-rotate-n90 {
    transform: rotate(-90deg);
}
</style>

<template>
    <div>
        <div class="px-3 d-flex align-center">
            <v-btn class="px-0 btn-collapsible" plain small :ripple="false" @click="expand = !expand">
                <v-icon small :class="!expand ? 'icon-rotate-n90' : ''">
                    {{ expand ? iconExpanded : iconCollapsed }}
                </v-icon>
                <span class="pl-1">{{ title }}</span>
            </v-btn>
            <v-divider class="ml-3"></v-divider>
        </div>
        <v-expand-transition>
            <div v-show="expand">
                <slot></slot>
            </div>
        </v-expand-transition>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { mdiChevronDown } from '@mdi/js'

const props = defineProps({
    iconExpanded: { type: String, required: false, default: mdiChevronDown },
    iconCollapsed: { type: String, required: false, default: mdiChevronDown },
    title: { type: String, required: true, default: '' },
    subPanelClass: { type: String, required: true },
})

const store = useStore()
const { viewport } = useBase()

const expand = computed({
    get: () => store.getters['gui/getPanelExpand'](props.subPanelClass, viewport.value),
    set: (newVal) => {
        store.dispatch('gui/saveExpandPanel', {
            name: props.subPanelClass,
            value: newVal,
            viewport: viewport.value,
        })
    },
})
</script>
