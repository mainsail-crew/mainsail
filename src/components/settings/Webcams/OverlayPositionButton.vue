<template>
    <v-btn
        icon
        v-bind="attrs"
        :class="['overlay-position-btn', { 'overlay-position-btn--inactive': !active }]"
        v-on="{
            click: (e) => {
                e.preventDefault()
                cyclePosition()
            },
        }">
        <v-icon>{{ icon }}</v-icon>
    </v-btn>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Prop, Vue } from 'vue-property-decorator'
import { mdiPanTopLeft, mdiPanTopRight, mdiPanBottomLeft, mdiPanBottomRight } from '@mdi/js'

type OverlayPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

@Component
export default class OverlayPositionButton extends Vue {
    @Prop({ type: String, required: true }) readonly value!: OverlayPosition
    @Prop({ type: Boolean, default: true }) readonly active!: boolean

    positions: OverlayPosition[] = ['top-left', 'top-right', 'bottom-right', 'bottom-left']

    get icon() {
        switch (this.value) {
            case 'top-left':
                return mdiPanTopLeft
            case 'top-right':
                return mdiPanTopRight
            case 'bottom-right':
                return mdiPanBottomRight
            case 'bottom-left':
            default:
                return mdiPanBottomLeft
        }
    }

    cyclePosition() {
        if (!this.active) {
            this.$emit('change', this.value)
            return
        }

        const currentIndex = this.positions.indexOf(this.value)
        const nextValue = this.positions[(currentIndex + 1) % this.positions.length]
        this.$emit('change', nextValue)
    }
}
</script>

<style scoped>
.overlay-position-btn {
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.overlay-position-btn--inactive {
    opacity: 0.3;
    pointer-events: none;
}
</style>
