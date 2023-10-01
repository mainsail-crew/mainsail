<template>
    <v-card
        :class="'panel ' + cardClass + ' ' + (marginBottom ? 'mb-3 mb-md-6' : '') + ' ' + (!expand ? 'expanded' : '')"
        :loading="loading">
        <v-toolbar
            flat
            dense
            :color="toolbarColor"
            :class="getToolbarClass"
            :height="panelToolbarHeight"
            class="panel-toolbar">
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
            <div v-show="expand || !collapsible">
                <slot />
            </div>
        </v-expand-transition>
    </v-card>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { panelToolbarHeight } from '@/store/variables'
import { mdiChevronDown } from '@mdi/js'
import { TranslateResult } from 'vue-i18n'

@Component
export default class Panel extends Mixins(BaseMixin) {
    mdiChevronDown = mdiChevronDown
    panelToolbarHeight = panelToolbarHeight

    @Prop({ default: null }) declare readonly icon: string | null
    @Prop({ required: true, default: '' }) declare readonly title: string | TranslateResult
    @Prop({ default: false }) declare readonly collapsible: boolean
    @Prop({ required: true }) declare readonly cardClass: string
    @Prop({ default: '' }) declare readonly toolbarColor: string
    @Prop({ default: '' }) declare readonly toolbarClass: string
    @Prop({ default: false }) declare readonly loading: boolean
    @Prop({ default: true }) declare readonly marginBottom: boolean
    @Prop({ default: false }) declare readonly hideButtonsOnCollapse: boolean

    get expand() {
        return this.$store.getters['gui/getPanelExpand'](this.cardClass, this.viewport)
    }

    set expand(newVal) {
        this.$store.dispatch('gui/saveExpandPanel', { name: this.cardClass, value: newVal, viewport: this.viewport })
    }

    get hasIconSlot() {
        return !!this.$slots.icon
    }

    get hasButtonsSlot() {
        return !!this.$slots.buttons
    }

    get getToolbarClass() {
        let output = this.toolbarClass

        if (this.collapsible) output += ' collapsible'

        return output
    }
}
</script>

<style lang="scss" scoped>
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

::v-deep .panel-toolbar .v-btn {
    height: 100% !important;
    max-height: none;
}
</style>

<style lang="scss">
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
