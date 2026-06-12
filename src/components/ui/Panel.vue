<template>
    <v-card
        :class="'panel ' + cardClass + ' ' + (marginBottom ? 'mb-3 mb-md-6' : '') + ' ' + (!expand ? 'expanded' : '')"
        :loading="loading"
        :style="cardStyle">
        <v-toolbar
            flat
            dense
            :color="toolbarColor"
            :class="getToolbarClass"
            :height="panelToolbarHeight"
            class="panel-toolbar"
            :style="additionalStyle">
            <slot name="buttons-left" />
            <v-toolbar-title class="d-flex align-center">
                <slot v-if="hasIconSlot" name="icon" />
                <v-icon v-if="icon !== null && !hasIconSlot" left>{{ icon }}</v-icon>
                <span v-if="title" class="subheading">{{ title }}</span>
            </v-toolbar-title>
            <slot name="buttons-title" />
            <v-spacer />
            <v-toolbar-items v-show="hasButtonsSlot || collapsible">
                <div v-if="expand || !hideButtonsOnCollapse" class="d-flex align-center">
                    <slot name="buttons" />
                </div>
                <v-btn v-if="collapsible" icon class="btn-collapsible" :ripple="true" @click="expand = !expand">
                    <v-icon :class="expand ? '' : 'icon-rotate-90'">{{ mdiChevronDown }}</v-icon>
                </v-btn>
            </v-toolbar-items>
        </v-toolbar>
        <v-expand-transition>
            <div v-show="expand || !collapsible" class="panel-content">
                <slot />
            </div>
        </v-expand-transition>
    </v-card>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { panelToolbarHeight } from '@/store/variables'
import { mdiChevronDown } from '@mdi/js'
import { TranslateResult } from 'vue-i18n'

const props = defineProps({
    icon: { type: String, default: null },
    title: { type: [String, Object], required: true, default: '' },
    collapsible: { type: Boolean, default: false },
    cardClass: { type: String, required: true },
    toolbarColor: { type: String, default: '' },
    toolbarClass: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    marginBottom: { type: Boolean, default: true },
    hideButtonsOnCollapse: { type: Boolean, default: false },
    height: { type: [Number, String], default: null },
})

const store = useStore()
const { viewport } = useBase()
const slots = useSlots()

const expand = computed({
    get: () => store.getters['gui/getPanelExpand'](props.cardClass, viewport.value),
    set: (newVal) => store.dispatch('gui/saveExpandPanel', { name: props.cardClass, value: newVal, viewport: viewport.value }),
})

const hasIconSlot = computed(() => !!slots.icon)
const hasButtonsSlot = computed(() => !!slots.buttons)

const getToolbarClass = computed(() => {
    let output = props.toolbarClass
    if (props.collapsible) output += ' collapsible'
    return output
})

const additionalStyle = computed(() => {
    return '' // Vue 3/Vuetify 3 handles theme differently
})

const cardStyle = computed(() => {
    if (!props.height) return undefined

    const height = typeof props.height === 'number' ? `${props.height}px` : props.height
    return {
        height,
        maxHeight: height,
        display: 'flex',
        flexDirection: 'column',
    }
})
</script>

<style scoped>
.expanded header.v-toolbar {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
}

.btn-collapsible > * {
    will-change: transform;
    transition: transform 500ms;
}
.icon-rotate-90 {
    transform: rotate(90deg);
}

.panel-toolbar {
    overflow-y: hidden;
}

.panel-content {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
}

:deep(.panel-toolbar) .v-btn {
    height: 100% !important;
    max-height: none;
}
</style>

<style>
.v-card.panel .v-toolbar__content {
    padding-right: 0;
}
.v-card.panel .v-toolbar__content .subheading {
    user-select: none;
}
.panel-toolbar .v-btn.v-btn--icon {
    width: var(--panel-toolbar-icon-btn-width) !important;
}
</style>
