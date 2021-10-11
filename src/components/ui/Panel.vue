<style lang="scss" scoped>

    .expanded header.v-toolbar{
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
    }

    .btn-collapsible i::before {
        transition: transform 500ms;
    }

    .icon-rotate-180:before {
        transform: rotate(180deg);
    }
</style>

<style lang="scss">
    .v-card.panel .v-toolbar__content {
        padding-right: 0;
    }
    .v-card.panel .v-toolbar__content .subheading {
        user-select: none;
    }
</style>

<template>
    <v-card :class="'panel '+cardClass+' '+(marginBottom ? 'mb-6' : '')+' '+(!expand ? 'expanded' : '')" :loading="loading">
        <v-toolbar flat dense :color="toolbarColor" :class="getToolbarClass" >
            <slot name="buttons-left"></slot>
            <v-toolbar-title class="d-flex align-center">
                <slot name="icon" v-if="hasIconSlot"></slot>
                <v-icon left v-if="icon !== null && !hasIconSlot">{{ icon }}</v-icon>
                <span class="subheading" v-if="title">{{ title }}</span>
            </v-toolbar-title>
            <slot name="buttons-title"></slot>
            <v-spacer></v-spacer>
            <v-toolbar-items v-if="hasButtonsSlot || collapsible">
                <slot name="buttons"></slot>
                <v-btn
                    v-if="collapsible"
                    @click="expand = !expand"
                    icon
                    class="btn-collapsible"
                    :ripple="true"
                ><v-icon :class="(!expand ? 'icon-rotate-180' : '')">mdi-chevron-down</v-icon></v-btn>
            </v-toolbar-items>
        </v-toolbar>
        <v-expand-transition>
            <div v-show="expand || !collapsible">
                <slot></slot>
            </div>
        </v-expand-transition>
    </v-card>
</template>

<script lang="ts">

import Component from 'vue-class-component'
import {Mixins, Prop} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class Panel extends Mixins(BaseMixin) {
    @Prop({ default: null }) readonly icon!: string | null
    @Prop({ required: true, default: '' }) readonly title!: string
    @Prop({ default: false }) readonly collapsible!: boolean
    @Prop({ required: true }) readonly cardClass!: string
    @Prop({ default: '' }) readonly toolbarColor!: string
    @Prop({ default: '' }) readonly toolbarClass!: string
    @Prop({ default: false }) readonly loading!: boolean
    @Prop({ default: true }) readonly marginBottom!: boolean

    get expand() {
        return this.$store.getters['gui/getPanelExpand'](this.cardClass)
    }

    set expand(newVal) {
        this.$store.dispatch('gui/saveExpandPanel', { name: this.cardClass, value: newVal })
    }

    get hasIconSlot() {
        return !! this.$slots.icon
    }

    get hasButtonsSlot() {
        return !! this.$slots.buttons
    }

    get getToolbarClass() {
        let output = this.toolbarClass

        if (this.collapsible) output += ' collapsible'

        return output
    }
}
</script>