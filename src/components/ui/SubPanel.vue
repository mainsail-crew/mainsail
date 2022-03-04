<style lang="scss" scoped>
.btn-collapsible > * {
    will-change: transform;
    transition: transform 500ms;
}

.icon-rotate-180 {
    transform: rotate(180deg);
}
</style>

<template>
    <div>
        <v-card-actions>
            <v-btn class="btn-collapsible" plain small @click="expand = !expand">
                <v-icon small :class="!expand ? 'icon-rotate-180' : ''">
                    {{ expand ? iconExpanded : iconCollapsed }}
                </v-icon>
                <span class="pl-1">{{ title }}</span>
            </v-btn>
            <v-divider class="mx-1"></v-divider>
        </v-card-actions>
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
import { mdiMinus, mdiPlus } from '@mdi/js'

@Component
export default class Panel extends Mixins(BaseMixin) {
    @Prop({ required: false, default: mdiMinus }) declare readonly iconExpanded: string | null
    @Prop({ required: false, default: mdiPlus }) declare readonly iconCollapsed: string | null
    @Prop({ required: true, default: '' }) declare readonly title: string
    @Prop({ required: true }) declare readonly subPanelClass: string

    get expand() {
        return this.$store.getters['gui/getPanelExpand'](this.subPanelClass)
    }

    set expand(newVal) {
        this.$store.dispatch('gui/saveExpandPanel', { name: this.subPanelClass, value: newVal })
    }
}
</script>
