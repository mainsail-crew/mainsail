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

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiChevronDown } from '@mdi/js'

@Component
export default class Panel extends Mixins(BaseMixin) {
    @Prop({ required: false, default: mdiChevronDown }) declare readonly iconExpanded: string | null
    @Prop({ required: false, default: mdiChevronDown }) declare readonly iconCollapsed: string | null
    @Prop({ required: true, default: '' }) declare readonly title: string
    @Prop({ required: true }) declare readonly subPanelClass: string

    get expand() {
        return this.$store.getters['gui/getPanelExpand'](this.subPanelClass, this.viewport)
    }

    set expand(newVal) {
        this.$store.dispatch('gui/saveExpandPanel', {
            name: this.subPanelClass,
            value: newVal,
            viewport: this.viewport,
        })
    }
}
</script>
