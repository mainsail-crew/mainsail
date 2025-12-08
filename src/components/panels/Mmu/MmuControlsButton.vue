<template>
    <v-tooltip top :disabled="!showTooltip">
        <template #activator="{ on, attrs }">
            <v-btn
                ref="button"
                block
                :small="btnSizeSmall"
                :large="btnSizeLarge"
                color="secondary"
                :disabled="disabled"
                :loading="btnLoading"
                v-bind="attrs"
                v-on="on"
                @click="doSend(command, command.toLowerCase())">
                <v-icon :left="!showTooltip">{{ icon }}</v-icon>
                <template v-if="!showTooltip">{{ text }}</template>
            </v-btn>
        </template>
        <span>{{ text }}</span>
    </v-tooltip>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'
import Vue from 'vue'

@Component
export default class MmuControlsButton extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: true }) readonly disabled!: boolean
    @Prop({ required: true }) readonly icon!: string
    @Prop({ required: true }) readonly text!: string
    @Prop({ required: true }) readonly command!: string
    @Prop({ default: 'small' }) readonly size!: 'small' | 'large'
    @Ref() readonly button!: Vue

    showTooltip = false

    get largeFilamentStatus(): boolean {
        return this.$store.state.gui.view.mmu.largeFilamentStatus ?? false
    }

    get btnSizeSmall() {
        return this.size === 'small'
    }

    get btnSizeLarge() {
        return this.size === 'large'
    }

    get btnLoading() {
        return this.loadings.includes(this.command.toLowerCase())
    }

    calcBtnSize() {
        const width = this.button.$el.clientWidth ?? undefined

        if (width === undefined || width > 130) {
            this.showTooltip = false
            return
        }

        this.showTooltip = true
    }

    mounted() {
        this.calcBtnSize()
        window.addEventListener('resize', this.calcBtnSize)
    }

    beforeDestroy() {
        window.removeEventListener('resize', this.calcBtnSize)
    }

    @Watch('largeFilamentStatus')
    onFilamentStatusSizeChange() {
        this.calcBtnSize()
    }
}
</script>
