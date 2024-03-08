<template>
    <tr
        :key="item.id"
        v-longpress:600="(e) => showContextMenu(e)"
        :class="cssClasses"
        @contextmenu="showContextMenu($event)"
        @click="detailsDialogBool = true">
        <td class="pr-0">
            <v-simple-checkbox v-ripple :value="isSelected" class="pa-0 mr-0" @click.stop="select(!isSelected)" />
        </td>
        <td class="px-0 text-center" style="width: 32px">
            <v-icon color="primary">{{ mdiNotebook }}</v-icon>
        </td>
        <td>{{ item.name }}</td>
        <td class="text-right text-no-wrap">
            <template v-if="item.reminder?.bool">
                <v-tooltip top>
                    <template #activator="{ on, attrs }">
                        <v-icon small color="primary" v-bind="attrs" v-on="on">
                            {{ mdiAlarm }}
                        </v-icon>
                    </template>
                    <div>
                        <div v-if="item.reminder.filament.bool">
                            <v-icon small class="mr-1">{{ mdiAlarm }}</v-icon>
                            {{ (item.reminder.filament.trigger / 1000).toFixed(1) }}m
                        </div>
                        <div v-if="item.reminder.printtime.bool">
                            <v-icon small class="mr-1">{{ mdiAlarm }}</v-icon>
                            {{ formatPrintTime(item.reminder.printtime.trigger, false) }}
                        </div>
                    </div>
                </v-tooltip>
            </template>
        </td>
        <td class="text-left text-no-wrap">
            {{ formatDateTime(item.start_time * 1000, false) }}
        </td>
        <td :colspan="tableFields.length - 1" />
        <v-menu v-model="contextMenuBool" :position-x="contextMenuX" :position-y="contextMenuY" absolute offset-y>
            <v-list>
                <v-list-item class="red--text" @click="deleteEntry">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('History.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>
    </tr>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import HistoryListPanelDetailsDialog from '@/components/dialogs/HistoryListPanelDetailsDialog.vue'
import Panel from '@/components/ui/Panel.vue'
import BaseMixin from '@/components/mixins/base'
import { mdiAlarm, mdiDelete, mdiNotebook } from '@mdi/js'
import { HistoryListPanelRow } from '@/components/panels/HistoryListPanel.vue'
import HistoryListPanelNoteDialog from '@/components/dialogs/HistoryListPanelNoteDialog.vue'
import { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'
import { formatPrintTime } from '@/plugins/helpers'

@Component({
    components: { HistoryListPanelNoteDialog, HistoryListPanelDetailsDialog, Panel },
})
export default class HistoryListPanel extends Mixins(BaseMixin) {
    mdiAlarm = mdiAlarm
    mdiDelete = mdiDelete
    mdiNotebook = mdiNotebook
    formatPrintTime = formatPrintTime

    detailsDialogBool = false

    contextMenuBool = false
    contextMenuX = 0
    contextMenuY = 0

    @Prop({ type: Object, required: true }) readonly item!: GuiMaintenanceStateEntry
    @Prop({ type: Array, required: true }) readonly tableFields!: HistoryListPanelRow[]
    @Prop({ type: Boolean, required: true }) readonly isSelected!: boolean

    get cssClasses() {
        let output = ['file-list-cursor', 'user-select-none']

        return output
    }

    select(newVal: boolean) {
        this.$emit('select', newVal)
    }

    showContextMenu(e: any) {
        e?.preventDefault()
        if (this.contextMenuBool) return

        this.contextMenuBool = true
        this.contextMenuX = e?.clientX || e?.pageX || window.screenX / 2
        this.contextMenuY = e?.clientY || e?.pageY || window.screenY / 2

        this.$nextTick(() => {
            this.contextMenuBool = true
        })
    }

    deleteEntry() {
        this.$store.dispatch('gui/maintenance/delete', this.item.id)
    }
}
</script>
