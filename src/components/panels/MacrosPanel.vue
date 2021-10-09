<style lang="scss" scoped>

</style>

<template>
    <panel
        v-if="klipperReadyForGui && macros.length > 0"
        icon="mdi-code-tags"
        :title="$t('Panels.MacrosPanel.Headline')"
        :collapsible="true"
        card-class="macros-panel"
    >
        <v-container>
            <v-row no-gutters v-if="macros.length">
                <v-col class="text-center mr-fix-2 mb-fix-2">
                    <v-btn v-for="(macro, index) in macros"
                           :key="index+99"
                           small
                           color="primary"
                           class="mr-2 mb-2"
                           :loading="loadings.includes('macro_'+macro.name)"
                           @click="doSendMacro(macro.name)">{{ macro.name.replace(/_/g, " ") }}</v-btn>
                </v-col>
            </v-row>
        </v-container>
    </panel>
</template>

<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import Panel from '@/components/ui/Panel.vue'
@Component({
    components: {Panel}
})
export default class MacrosPanel extends Mixins(BaseMixin) {

    get macros() {
        return this.$store.getters['printer/getMacros']
    }

    doSendMacro(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'macro_'+gcode })
    }
}
</script>
