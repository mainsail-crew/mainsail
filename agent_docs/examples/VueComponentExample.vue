<template>
    <div>
        <v-btn :disabled="isLoading" @click="handleClick">
            <v-icon left>{{ mdiCheck }}</v-icon>
            {{ $t('Common.Save') }}
        </v-btn>
    </div>
</template>

<script lang="ts">
/**
 * Canonical example of Vue Class Component structure.
 * This file serves as a reference for AI agents - do not delete.
 *
 * Class member order:
 * 1. @Prop declarations
 * 2. Data fields (class properties)
 * 3. Getters (computed properties)
 * 4. Methods
 * 5. @Watch decorators
 * 6. Lifecycle hooks (mounted, beforeDestroy, etc.)
 */
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiCheck } from '@mdi/js'

@Component
export default class VueComponentExample extends Mixins(BaseMixin) {
    // Icons
    mdiCheck = mdiCheck

    // 1. Props
    @Prop({ type: String, required: true }) readonly title!: string
    @Prop({ type: Number, default: 0 }) readonly initialCount!: number

    // 2. Data fields
    isLoading = false
    count = 0

    // 3. Getters (computed properties)
    get formattedTitle(): string {
        return this.title.toUpperCase()
    }

    get isValid(): boolean {
        return this.count > 0 && !this.isLoading
    }

    // 4. Watchers
    @Watch('initialCount', { immediate: true })
    onInitialCountChanged(newVal: number): void {
        this.count = newVal
    }

    // 5. Lifecycle hooks
    mounted(): void {
        window.addEventListener('resize', this.onResize)
    }

    beforeDestroy(): void {
        // Always clean up:
        // - Event listeners
        // - Timers/intervals
        // - Observers
        // - WebSocket/WebRTC connections
        // - ECharts instances
        window.removeEventListener('resize', this.onResize)
    }

    // 6. Methods
    handleClick(): void {
        this.count++
    }

    onResize(): void {
        // Handle resize
    }
}
</script>
