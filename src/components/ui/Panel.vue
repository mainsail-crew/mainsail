<style lang="scss" scoped>
    .expanded header.v-toolbar{
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
    }

    .expand-button:focus:after {
        opacity: 0 !important;
    }

    .icon-rotate-180 {
        transform: rotate(180deg);
    }
</style>

<template>
    <v-card :class="cardClass+' mb-6 '+(!expand ? 'expanded' : '')" :loading="true">
        <v-toolbar flat dense :color="toolbarColor" >
            <v-toolbar-title class="d-flex align-center">
                <slot name="icon" v-if="hasIconSlot"></slot>
                <v-icon left v-if="icon !== null && !hasIconSlot">{{ icon }}</v-icon>
                <span class="subheading" v-if="title">{{ title }}</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <slot name="buttons"></slot>
            <v-icon
                v-if="collapsible"
                @click="expand = !expand"
                :class="'ml-3 expand-button '+(!expand ? 'icon-rotate-180' : '')"
            >mdi-chevron-down</v-icon>
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
    @Prop({ default: false }) readonly loading!: boolean

    get expand() {
        return this.$store.getters['gui/getPanelExpand'](this.cardClass)
    }

    set expand(newVal) {
        this.$store.dispatch('gui/saveExpandPanel', { name: this.cardClass, value: newVal })
    }

    get hasIconSlot() {
        return !! this.$slots.icon
    }
}
</script>