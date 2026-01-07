<template>
    <v-dialog v-model="showDialog" width="400" @click:outside="closeDialog">
        <panel
            :title="$t('Panels.AfcPanel.InfiniteSpoolHeadline')"
            :icon="afcIconLogo"
            card-class="afc-unit-lane-infinite-spool-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col class="pb-0">
                        <p>{{ $t('Panels.AfcPanel.InfiniteSpoolDescription', { name }) }}</p>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="pt-0 text-center">
                        <v-btn
                            v-for="lane in laneList"
                            :key="lane"
                            :disabled="runoutLane === lane"
                            color="primary"
                            class="ma-2"
                            @click="setRunout(lane)">
                            {{ lane }}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop, VModel } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick } from '@mdi/js'
import AfcMixin from '@/components/mixins/afc'
import { afcIconLogo } from '@/plugins/afcIcons'

@Component({
    components: { Panel },
})
export default class AfcUnitLaneInfiniteDialog extends Mixins(BaseMixin, AfcMixin) {
    afcIconLogo = afcIconLogo
    mdiCloseThick = mdiCloseThick

    @VModel({ type: Boolean }) showDialog!: boolean
    @Prop({ type: String, required: true }) readonly name!: string

    get lane() {
        return this.getAfcLaneObject(this.name)
    }

    get runoutLane() {
        return this.lane.runout_lane ?? 'NONE'
    }

    get laneList() {
        const allLanes = this.afc.lanes ?? []
        let output = []

        for (const laneName of allLanes) {
            if (laneName === this.name) continue

            const lane = this.getAfcLaneObject(laneName)
            const prep = lane.prep ?? false
            const load = lane.load ?? false

            if (prep && load) output.push(lane.name)
        }

        output = output.sort((a, b) => a.localeCompare(b))
        output.unshift('NONE')

        return output
    }

    setRunout(newLane: string) {
        this.doSend(`SET_RUNOUT LANE=${this.name} RUNOUT=${newLane}`)

        this.closeDialog()
    }

    doSend(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    closeDialog() {
        this.showDialog = false
    }
}
</script>
