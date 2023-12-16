<style scoped></style>

<template>
    <div>
        <template v-if="['printing', 'paused', 'error', 'cancelled'].includes(printer_state)">
            <status-panel-printstatus-printing></status-panel-printstatus-printing>
        </template>
        <template v-if="['complete'].includes(printer_state)">
            <status-panel-printstatus-complete></status-panel-printstatus-complete>
        </template>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import StatusPanelPrintstatusPrinting from '@/components/panels/Status/PrintstatusPrinting.vue'
import StatusPanelPrintstatusComplete from '@/components/panels/Status/PrintstatusComplete.vue'

@Component({
    components: {
        StatusPanelPrintstatusPrinting,
        StatusPanelPrintstatusComplete,
    },
})
export default class StatusPanelPrintstatus extends Mixins(BaseMixin) {}
</script>
