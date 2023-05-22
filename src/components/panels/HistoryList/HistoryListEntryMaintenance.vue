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
            <v-icon>{{ mdiFile }}</v-icon>
        </td>
        <td>{{ item.name }}</td>
        <td class="text-right text-no-wrap">bla</td>
        <td :colspan="tableFields.length" />
    </tr>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import HistoryListPanelDetailsDialog from '@/components/dialogs/HistoryListPanelDetailsDialog.vue'
import Panel from '@/components/ui/Panel.vue'
import BaseMixin from '@/components/mixins/base'
import { mdiCloseThick, mdiDelete, mdiFile, mdiFileCancel } from '@mdi/js'
import { HistoryListPanelRow } from '@/components/panels/HistoryListPanel.vue'
import HistoryListPanelNoteDialog from '@/components/dialogs/HistoryListPanelNoteDialog.vue'
import { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'

@Component({
    components: { HistoryListPanelNoteDialog, HistoryListPanelDetailsDialog, Panel },
})
export default class HistoryListPanel extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiDelete = mdiDelete
    mdiFile = mdiFile

    private detailsDialogBool = false

    private contextMenuBool = false
    private contextMenuX = 0
    private contextMenuY = 0

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
}
</script>
