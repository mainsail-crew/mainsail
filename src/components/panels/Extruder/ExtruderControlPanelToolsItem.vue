<template>
    <v-btn
        :class="buttonClass"
        :disabled="printerIsPrintingOnly"
        :style="buttonStyle"
        dense
        class="flex-grow-1 px-0"
        @click="doSend(macro.name)">
        {{ macro.name }}
    </v-btn>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { PrinterStateMacro } from '@/store/printer/types'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'

@Component({
    components: {},
})
export default class ExtruderControlPanel extends Mixins(BaseMixin, ControlMixin) {
    @Prop({ type: Object }) macro!: PrinterStateMacro

    get active() {
        return this.macro.variables.active ?? false
    }

    get color() {
        return this.macro.variables.color ?? this.macro.variables.colour ?? null
    }

    get buttonClass() {
        return {
            'primary--text': this.active,
        }
    }

    get buttonStyle() {
        return {
            'background-color': '#' + this.color,
        }
    }
}
</script>
