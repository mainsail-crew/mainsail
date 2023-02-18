<template>
    <div>
        <!-- TODO: translate title -->
        <panel :icon="mdiBell" title="Reminders" card-class="history-reminders-panel" :collapsible="true">
            <v-card-text>
                <v-row>
                    <v-col class="offset-4 d-flex align-center justify-end">
                        <template v-if="selectedReminders.length">
                            <v-btn
                                title="Delete"
                                color="error"
                                class="px-2 minwidth-0 ml-3"
                                @click="deleteSelectedDialog = true">
                                <v-icon>{{ mdiDelete }}</v-icon>
                            </v-btn>
                        </template>
                        <!-- TODO: translate title -->
                        <v-btn title="New Reminder" class="px-2 minwidth-0 ml-3" @click="openCreateReminderDialog">
                            <v-icon>{{ mdiPlus }}</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider class="mb-3"></v-divider>
            <v-data-table
                v-model="selectedReminders"
                :items="reminders"
                class="history-reminders-table"
                :headers="headers"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                item-key="id"
                mobile-breakpoint="0"
                show-select>
                <template slot="no-data">
                    <!-- TODO: translate -->
                    <div class="text-center">No Reminders</div>
                </template>

                <template #item="{ index, item, isSelected, select }">
                    <tr
                        :key="`${index} ${item.id}`"
                        v-longpress:600="(e) => showContextMenu(e, item)"
                        :class="'user-select-none'"
                        @contextmenu="($event) => showContextMenu($event, item)">
                        <td class="pr-0">
                            <v-simple-checkbox
                                v-ripple
                                :value="isSelected"
                                class="pa-0 mr-0"
                                @click.stop="select(!isSelected)"></v-simple-checkbox>
                        </td>
                        <td class="text-no-wrap">
                            {{ item.name }}
                        </td>
                        <td class="text-right text-no-wrap">
                            <v-tooltip top>
                                <template #activator="{ on, attrs }">
                                    <span v-bind="attrs" v-on="on">
                                        <v-icon small :color="getStatusColor(item.remaining_print_time)">
                                            {{ getStatusIcon(item.remaining_print_time) }}
                                        </v-icon>
                                    </span>
                                </template>
                                <span>
                                    {{ getStatusText(item.remaining_print_time) }}
                                </span>
                            </v-tooltip>
                        </td>
                        <td class="text-no-wrap">
                            {{ formatPrintTime(item.remaining_print_time) }}
                        </td>
                        <td class="text-no-wrap">
                            {{ formatPrintTime(item.time_delta) }}
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </panel>
        <v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list>
                <v-list-item @click="openEditReminderDialog(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiPencil }}</v-icon>
                    <!-- TODO: translate -->
                    Edit
                </v-list-item>
                <v-list-item @click="repeatReminder(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiRepeatOnce }}</v-icon>
                    <!-- TODO: translate -->
                    Repeat
                </v-list-item>
                <v-list-item @click="deleteReminder(contextMenu.item)">
                    <v-icon class="mr-1">{{ mdiDelete }}</v-icon>
                    <!-- TODO: translate -->
                    Delete
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="deleteSelectedDialog" max-width="400">
            <panel
                :title="$t('History.Delete').toString()"
                card-class="history-reminders-delete-selected-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="deleteSelectedDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <!-- TODO: translate -->
                    <p class="mb-0">Do you really want to delete {{ selectedReminders.length }} reminders?</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="deleteSelectedDialog = false">{{ $t('History.Cancel') }}</v-btn>
                    <v-btn color="error" text @click="deleteSelectedReminders">{{ $t('History.Delete') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="createReminderDialog" max-width="400">
            <!-- TODO: translate title -->
            <panel title="Create Reminder" card-class="history-reminders-create-dialog" :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="createReminderDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <!-- TODO: translate title -->
                    <settings-row title="Name">
                        <v-text-field
                            v-model="creatingDisplayName"
                            :rules="nameInputRules"
                            hide-details
                            outlined
                            dense></v-text-field>
                    </settings-row>
                    <!-- TODO: translate title -->
                    <settings-row title="Print Hours">
                        <v-text-field
                            v-model="creatingPrintHours"
                            type="Number"
                            :rules="hoursInputRules"
                            hide-details
                            outlined
                            dense></v-text-field>
                    </settings-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :disabled="isInvalidName || isInvalidHours" color="" text @click="createReminder">
                        <!-- TODO: translate -->
                        Confirm
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <v-dialog v-model="editReminderDialog" max-width="400">
            <panel title="Edit Reminder" card-class="history-reminders-edit-dialog" :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="editReminderDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <!-- TODO: translate title -->
                    <settings-row title="Name">
                        <v-text-field
                            v-model="editingDisplayName"
                            :rules="nameInputRules"
                            hide-details
                            outlined
                            dense></v-text-field>
                    </settings-row>
                    <!-- TODO: translate title -->
                    <settings-row title="Print Hours">
                        <v-text-field
                            v-model="editingPrintHours"
                            type="Number"
                            :rules="hoursInputRules"
                            hide-details
                            outlined
                            dense></v-text-field>
                    </settings-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :disabled="isInvalidName || isInvalidHours" color="" text @click="editReminder">
                        <!-- TODO: translate -->
                        Confirm
                    </v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import {
    mdiBell,
    mdiDelete,
    mdiPencil,
    mdiPlus,
    mdiClockOutline,
    mdiClockAlertOutline,
    mdiCloseThick,
    mdiRepeatOnce,
} from '@mdi/js'
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { GuiRemindersStateReminder } from '@/store/gui/reminders/types'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import SettingsRow from '@/components/settings/SettingsRow.vue'

@Component({ components: { Panel, SettingsRow } })
export default class HistoryRemindersPanel extends Mixins(BaseMixin) {
    mdiBell = mdiBell
    mdiDelete = mdiDelete
    mdiPencil = mdiPencil
    mdiPlus = mdiPlus
    mdiClockOutline = mdiClockOutline
    mdiClockAlertOutline = mdiClockAlertOutline
    mdiCloseThick = mdiCloseThick
    mdiRepeatOnce = mdiRepeatOnce

    deleteSelectedDialog = false
    createReminderDialog = false
    editReminderDialog = false
    selectedReminders = []
    editingReminder: GuiRemindersStateReminder | null = null
    creatingReminder: GuiRemindersStateReminder | null = null

    nameInputRules = [(value: string) => !!value || this.$t('Files.InvalidNameEmpty')]
    isInvalidName = false

    // TODO: translate
    hoursInputRules = [(value: number) => value > 0 || 'Must be a positive number']
    isInvalidHours = false

    sortBy = 'remaining_print_time'
    sortDesc = false

    contextMenu = {
        shown: false,
        touchTimer: undefined,
        x: 0,
        y: 0,
        item: {},
    }

    // TODO: translate
    headers = [
        {
            text: 'Name',
            value: '',
            align: 'left',
        },
        {
            text: '',
            value: '',
            align: 'left',
        },
        {
            text: 'Remaining Print Hours',
            value: '',
            align: 'left',
        },
        {
            text: 'Total Print Hours',
            value: '',
            align: 'left',
        },
    ]

    get tableFields() {
        return this.headers.filter((col: any) => col.value !== '')
    }

    get totalPrintTime() {
        return 'total_print_time' in this.$store.state.server.history.job_totals
            ? this.$store.state.server.history.job_totals.total_print_time
            : 0
    }

    get reminders() {
        const baseReminders: GuiRemindersStateReminder[] = this.$store.getters['gui/reminders/getReminders']
        if (!baseReminders) return []
        return baseReminders.map((reminder: GuiRemindersStateReminder) => {
            let tempReminder = { ...reminder }
            tempReminder.remaining_print_time =
                reminder.time_delta - (this.totalPrintTime - reminder.start_total_print_time)
            return tempReminder
        })
    }

    get editingDisplayName() {
        if (!this.editingReminder) return ''
        return this.editingReminder.name
    }

    set editingDisplayName(value: string) {
        if (!this.editingReminder) return
        this.editingReminder.name = value
    }

    get editingPrintHours() {
        if (!this.editingReminder) return '0'
        return String(this.editingReminder.time_delta)
    }

    set editingPrintHours(value: string) {
        if (!this.editingReminder) return
        this.editingReminder.time_delta = parseFloat(value) || 0
    }

    get creatingDisplayName() {
        if (!this.creatingReminder) return ''
        return this.creatingReminder.name
    }

    set creatingDisplayName(value: string) {
        if (!this.creatingReminder) return
        this.creatingReminder.name = value
    }

    get creatingPrintHours() {
        if (!this.creatingReminder) return '0'
        return String(this.creatingReminder.time_delta)
    }

    set creatingPrintHours(value: string) {
        if (!this.creatingReminder) return
        this.creatingReminder.time_delta = parseFloat(value) || 0
    }

    getStatusIcon(remainingPrintTime: number) {
        return remainingPrintTime >= 0 ? mdiClockOutline : mdiClockAlertOutline
    }

    getStatusColor(remainingPrintTime: number) {
        return remainingPrintTime >= 0 ? 'orange' : 'red'
    }

    // TODO: translate
    getStatusText(remainingPrintTime: number) {
        return remainingPrintTime >= 0 ? 'Active' : 'Overdue'
    }

    formatPrintTime(totalSeconds: number) {
        if (totalSeconds) {
            let output = ''

            const hours = Math.floor(totalSeconds / 3600)
            totalSeconds %= 3600
            if (hours) output += ' ' + hours + 'h'

            const minutes = Math.floor(totalSeconds / 60)
            if (minutes) output += ' ' + minutes + 'm'

            const seconds = totalSeconds % 60
            if (seconds) output += ' ' + seconds.toFixed(0) + 's'

            return output
        }

        return '--'
    }

    formatPrintTimeForEdit(totalSeconds: number) {
        if (totalSeconds) {
            return (totalSeconds / 3600).toFixed(2)
        }
        return '0'
    }

    showContextMenu(e: any, item: GuiRemindersStateReminder) {
        if (!this.contextMenu.shown) {
            e?.preventDefault()
            this.contextMenu.shown = true
            this.contextMenu.x = e?.clientX || e?.pageX || window.screenX / 2
            this.contextMenu.y = e?.clientY || e?.pageY || window.screenY / 2
            this.contextMenu.item = item
            this.$nextTick(() => {
                this.contextMenu.shown = true
            })
        }
    }

    repeatReminder(reminder: GuiRemindersStateReminder) {
        reminder.start_total_print_time = this.totalPrintTime
        this.$store.dispatch('gui/reminders/update', reminder)
    }

    deleteSelectedReminders() {
        this.selectedReminders.forEach((item: GuiRemindersStateReminder) => {
            this.$store.dispatch('gui/reminders/delete', item.id)
        })

        this.selectedReminders = []
        this.deleteSelectedDialog = false
    }

    deleteReminder(reminder: GuiRemindersStateReminder) {
        this.$store.dispatch('gui/reminders/delete', reminder.id)
    }

    openCreateReminderDialog() {
        this.createReminderDialog = true
        this.creatingReminder = {
            id: '',
            name: '',
            start_total_print_time: 0,
            time_delta: 0,
        }
        this.isInvalidHours = true
        this.isInvalidName = true
    }

    createReminder() {
        if (!this.creatingReminder) return

        this.creatingReminder.start_total_print_time = this.totalPrintTime
        this.creatingReminder.time_delta = Math.round(this.creatingReminder.time_delta * 3600)
        this.$store.dispatch('gui/reminders/store', { values: this.creatingReminder })
        this.createReminderDialog = false
        this.creatingReminder = null
    }

    openEditReminderDialog(reminder: GuiRemindersStateReminder) {
        this.editingReminder = { ...reminder }
        this.editingReminder.time_delta = Math.round(this.editingReminder.time_delta / 3600)
        this.isInvalidHours = false
        this.isInvalidName = false
        this.editReminderDialog = true
    }

    editReminder() {
        if (!this.editingReminder) return

        this.editingReminder.time_delta = Math.round(this.editingReminder.time_delta * 3600)
        this.$store.dispatch('gui/reminders/update', this.editingReminder)
        this.editReminderDialog = false
        this.editingReminder = null
    }

    @Watch('editingDisplayName')
    onEditingDisplayname(val: string) {
        this.isInvalidName = !val
    }

    @Watch('editingPrintHours')
    onEditingPrintHours(val: string) {
        this.isInvalidHours = parseFloat(val) <= 0
    }

    @Watch('creatingDisplayName')
    onCreatingDisplayName(val: string) {
        this.isInvalidName = !val
    }

    @Watch('creatingPrintHours')
    onCreatingPrintHours(val: string) {
        this.isInvalidHours = parseFloat(val) <= 0
    }
}
</script>
