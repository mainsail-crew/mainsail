<template>
    <v-card
        class="gcode-dir-card"
        v-longpress:600="showContextMenuAction"
        @click="goToDirectory"
        @contextmenu="showContextMenuAction($event)">
        <div class="gcode-dir-card__icon">
            <v-icon size="48" color="primary">{{ mdiFolder }}</v-icon>
        </div>
        <div class="gcode-dir-card__name" :title="item.filename">{{ item.filename }}</div>
        <div class="gcode-dir-card__meta">
            <span v-if="item.childrens"> {{ item.childrens.length }} </span>
            <span v-else>--</span>
        </div>

        <v-menu
            v-model="showContextMenu"
            :position-x="showContextMenuX"
            :position-y="showContextMenuY"
            absolute
            offset-y>
            <v-list>
                <v-list-item @click="showRenameDirectoryDialog = true">
                    <v-icon class="mr-1">{{ mdiRenameBox }}</v-icon>
                    {{ $t('Files.Rename') }}
                </v-list-item>
                <v-list-item class="red--text" @click="showDeleteDirectoryDialog = true">
                    <v-icon class="mr-1" color="error">{{ mdiDelete }}</v-icon>
                    {{ $t('Files.Delete') }}
                </v-list-item>
            </v-list>
        </v-menu>

        <gcodefiles-rename-directory-dialog v-model="showRenameDirectoryDialog" :item="item" />
        <confirmation-dialog
            v-model="showDeleteDirectoryDialog"
            :title="$t('Files.DeleteDirectory')"
            :text="$t('Files.DeleteDirectoryQuestion', { name: item.filename })"
            :action-button-text="$t('Buttons.Delete')"
            @action="deleteDirectory" />
    </v-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import type { LongpressEvent } from '@/directives/longpress'
import BaseMixin from '@/components/mixins/base'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import { FileStateGcodefile } from '@/store/files/types'
import { mdiDelete, mdiFolder, mdiRenameBox } from '@mdi/js'
import { CLOSE_CONTEXT_MENU, EventBus } from '@/plugins/eventBus'
import GcodefilesRenameDirectoryDialog from '@/components/dialogs/GcodefilesRenameDirectoryDialog.vue'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'

@Component({
    components: {
        ConfirmationDialog,
        GcodefilesRenameDirectoryDialog,
    },
})
export default class GcodefilesPanelListCardDirectory extends Mixins(BaseMixin, GcodefilesMixin) {
    mdiDelete = mdiDelete
    mdiFolder = mdiFolder
    mdiRenameBox = mdiRenameBox

    showContextMenu = false
    showContextMenuX = 0
    showContextMenuY = 0

    showRenameDirectoryDialog = false
    showDeleteDirectoryDialog = false

    @Prop({ type: Object, required: true }) readonly item!: FileStateGcodefile

    goToDirectory() {
        this.currentPath += '/' + this.item.filename
    }

    deleteDirectory() {
        this.$socket.emit(
            'server.files.delete_directory',
            { path: 'gcodes' + this.currentPath + '/' + this.item.filename, force: true },
            { action: 'files/getDeleteDir' }
        )
    }

    showContextMenuAction(e: MouseEvent | LongpressEvent) {
        e?.preventDefault()
        EventBus.$emit(CLOSE_CONTEXT_MENU)

        this.showContextMenuX = e?.clientX || e?.pageX || window.screenX / 2
        this.showContextMenuY = e?.clientY || e?.pageY || window.screenY / 2

        this.showContextMenu = true
    }

    closeContextMenu() {
        this.showContextMenu = false
    }

    mounted() {
        EventBus.$on(CLOSE_CONTEXT_MENU, this.closeContextMenu)
    }

    beforeDestroy() {
        EventBus.$off(CLOSE_CONTEXT_MENU, this.closeContextMenu)
    }
}
</script>

<style scoped>
.gcode-dir-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px 12px;
    border-radius: 4px;
    background: rgb(var(--v-surface));
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: transform 200ms cubic-bezier(0.25, 1, 0.5, 1), border-color 200ms cubic-bezier(0.25, 1, 0.5, 1);
    cursor: pointer;
    min-height: 168px;
    user-select: none;
}

.gcode-dir-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 107, 53, 0.4);
}

.gcode-dir-card__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 4px;
}

.gcode-dir-card__name {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.92);
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    width: 100%;
}

.gcode-dir-card__meta {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
}
</style>
