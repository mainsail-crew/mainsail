<template>
    <v-dialog :value="show" width="400" @click:outside="closeDialog">
        <panel
            :title="$t('Panels.AfcPanel.LaneMapping')"
            :icon="afcIconLogo"
            card-class="afc-unit-lane-mapping-tool-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col class="pb-0">
                        <p>{{ $t('Panels.AfcPanel.LaneMappingToCommand', { name }) }}</p>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="pt-0 text-center">
                        <v-btn
                            v-for="tool in afcMapList"
                            :key="tool"
                            :disabled="tool.toLowerCase() === mappedTool.toLowerCase()"
                            color="primary"
                            class="ma-2"
                            @click="mapTool(tool)">
                            {{ tool.toUpperCase() }}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick } from '@mdi/js'
import { afcIconLogo } from '@/plugins/afcIcons'
import AfcMixin from '@/components/mixins/afc'

@Component({
    components: { Panel },
})
export default class AfcUnitLaneMappingToolDialog extends Mixins(BaseMixin, AfcMixin) {
    afcIconLogo = afcIconLogo
    mdiCloseThick = mdiCloseThick

    @Prop({ type: Boolean, required: true }) readonly show!: boolean
    @Prop({ type: String, required: true }) readonly name!: string

    get lane() {
        return this.getAfcLaneObject(this.name)
    }

    get mappedTool() {
        return this.lane.map ?? '--'
    }

    mapTool(newTool: string) {
        this.doSend(`SET_MAP LANE=${this.name} MAP=${newTool}`)

        this.closeDialog()
    }

    doSend(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    closeDialog() {
        this.$emit('close')
    }
}
</script>
