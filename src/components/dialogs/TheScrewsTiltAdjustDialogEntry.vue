<template>
    <settings-row :title="outputName" :sub-title="subTitle">
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
    z: number
    sign?: string
    adjust?: string
    is_base: boolean
}
@Component({
    components: { Panel, Responsive, SettingsRow },
})
export default class TheScrewsTiltAdjustDialogEntry extends Mixins(BaseMixin, ControlMixin) {
    mdiRotateLeft = mdiRotateLeft
    mdiCloseThick = mdiCloseThick
    mdiRotateRight = mdiRotateRight
    @Prop({ required: true }) declare readonly name: string
    @Prop({ required: true }) declare readonly result: ScrewsTiltAdjustResult
    get settings() {
        return this.$store.state.printer.configfile?.settings?.screws_tilt_adjust ?? {}
    }
    get outputName() {
        return this.settings[this.name + '_name'] ?? 'Unknown'
    }
    get coordinates() {
        return this.settings[this.name] ?? [0, 0]
    }
    get x() {
        return this.coordinates[0] ?? 0
    }
    get y() {
        return this.coordinates[1] ?? 0
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
        return this.result.is_base ?? false
    }
}
</script>
