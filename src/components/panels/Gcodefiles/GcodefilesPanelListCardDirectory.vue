<template>
    <v-card
        v-longpress:600="showContextMenuAction"
        class="gcode-dir-card"
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

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { LongpressEvent } from '@/directives/longpress'
import { useGcodeFiles } from '@/composables/useGcodeFiles'
import { useSocket } from '@/composables/useSocket'
import { FileStateGcodefile } from '@/store/files/types'
import { mdiDelete, mdiFolder, mdiRenameBox } from '@mdi/js'
import { CLOSE_CONTEXT_MENU, EventBus } from '@/plugins/eventBus'
import GcodefilesRenameDirectoryDialog from '@/components/dialogs/GcodefilesRenameDirectoryDialog.vue'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'

const props = defineProps<{
    item: FileStateGcodefile
}>()

const { currentPath, setCurrentPath } = useGcodeFiles()
const socket = useSocket()

const showContextMenu = ref(false)
const showContextMenuX = ref(0)
const showContextMenuY = ref(0)

const showRenameDirectoryDialog = ref(false)
const showDeleteDirectoryDialog = ref(false)

function goToDirectory() {
    setCurrentPath(currentPath.value + '/' + props.item.filename)
}

function deleteDirectory() {
    socket.emit(
        'server.files.delete_directory',
        { path: 'gcodes' + currentPath.value + '/' + props.item.filename, force: true },
        { action: 'files/getDeleteDir' }
    )
}

function showContextMenuAction(e: MouseEvent | LongpressEvent) {
    e?.preventDefault()
    EventBus.$emit(CLOSE_CONTEXT_MENU)

    showContextMenuX.value = e?.clientX || e?.pageX || window.screenX / 2
    showContextMenuY.value = e?.clientY || e?.pageY || window.screenY / 2

    showContextMenu.value = true
}

function closeContextMenu() {
    showContextMenu.value = false
}

onMounted(() => {
    EventBus.$on(CLOSE_CONTEXT_MENU, closeContextMenu)
})

onBeforeUnmount(() => {
    EventBus.$off(CLOSE_CONTEXT_MENU, closeContextMenu)
})
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
