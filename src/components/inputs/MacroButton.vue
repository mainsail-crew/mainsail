<style scoped>

</style>

<template>
    <v-btn
       small
       :color="color"
       :loading="loadings.includes('macro_'+macro.name)"
       @click="doSendMacro(macro.name)">{{ macro.name.replace(/_/g, " ") }}</v-btn>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import {Mixins, Prop} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {GuiStateMacrogroupMacros} from '@/store/gui/types'

@Component
export default class MacroButton extends Mixins(BaseMixin) {
    @Prop({ required: true }) readonly macro!: GuiStateMacrogroupMacros
    @Prop({ default: 'primary' }) readonly color!: string

    doSendMacro(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'macro_'+gcode })
    }
}
</script>