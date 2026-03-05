<template>
    <div :class="'consoleTable ' + (isMini ? 'mini' : '')">
        <v-row v-if="events.length === 0" class="pa-0 ma-0">
            <v-col class="text-center py-3">{{ $t('Console.Empty') }}</v-col>
        </v-row>
        <template v-else>
            <console-table-entry
                v-for="(event, index) of events"
                :key="index"
                class="consoleTableRow"
                :event="event"
                @command-click="commandClick" />
        </template>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import Vue from 'vue'
import { Prop } from 'vue-property-decorator'
import { ServerStateEvent } from '@/store/server/types'
import ConsoleTableEntry from '@/components/console/ConsoleTableEntry.vue'

@Component({
    components: { ConsoleTableEntry },
})
export default class ConsoleTable extends Vue {
    @Prop({ required: true }) readonly events!: ServerStateEvent[]
    @Prop({ required: false, default: false }) readonly isMini!: boolean

    commandClick(msg: string) {
        this.$emit('command-click', msg)
    }
}
</script>
