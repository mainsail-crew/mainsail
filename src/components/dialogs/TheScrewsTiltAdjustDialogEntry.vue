<template>
    <settings-row :title="name" :sub-title="subTitle">
        <v-chip v-if="!(is_base ?? false)" label small>
            <v-icon v-if="sign === 'CCW'" small left>{{ mdiRotateLeft }}</v-icon>
            <v-icon v-if="sign === 'CW'" small left>{{ mdiRotateRight }}</v-icon>
            {{ adjust }}
        </v-chip>
        <v-chip v-else label small>{{ $t('ScrewsTiltAdjust.Base') }}</v-chip>
    </settings-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import Responsive from '@/components/ui/Responsive.vue'
import SettingsRow from '@/components/settings/SettingsRow.vue'

import { mdiRotateLeft, mdiRotateRight, mdiCloseThick } from '@mdi/js'
import ControlMixin from '@/components/mixins/control'

interface ScrewsTiltAdjustResult {
    name: string
    x: number
    y: number
    z: number
    sign?: string
    adjust: string
    is_base?: boolean
}

@Component({
    components: { Panel, Responsive, SettingsRow },
})
export default class TheScrewsTiltAdjustDialogEntry extends Mixins(BaseMixin, ControlMixin) {
    mdiRotateLeft = mdiRotateLeft
    mdiCloseThick = mdiCloseThick
    mdiRotateRight = mdiRotateRight

    @Prop({ required: true }) declare readonly result: ScrewsTiltAdjustResult

    get name() {
        return this.result.name
    }

    get x() {
        return this.result.x.toFixed(1)
    }

    get y() {
        return this.result.y.toFixed(1)
    }

    get z() {
        return this.result.z.toFixed(3)
    }

    get subTitle() {
        return `(X: ${this.x}, Y: ${this.y}, Z: ${this.z})`
    }

    get sign() {
        return this.result.sign ?? ''
    }

    get adjust() {
        return this.result.adjust ?? '00:00'
    }

    get is_base() {
        if (!('sign' in this.result)) return true

        return this.result.is_base ?? false
    }
}
</script>

<style lang="scss" scoped></style>
