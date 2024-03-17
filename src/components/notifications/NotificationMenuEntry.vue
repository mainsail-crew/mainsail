<template>
    <v-alert :class="`notification-menu-entry--priority-${entry.priority}`" text :color="alertColor" border="left">
        <v-row align="start" class="flex-nowrap">
            <v-col class="grow pb-2">
                <div class="notification-menu-entry__headline mb-1 text-subtitle-1">
                    <a
                        v-if="'url' in entry"
                        :class="`text-decoration-none ${alertColor}--text `"
                        :href="entry.url"
                        target="_blank">
                        <v-icon small :class="`${alertColor}--text pb-1`">
                            {{ mdiLinkVariant }}
                        </v-icon>
                        {{ entry.title }}
                    </a>
                    <span v-else :class="`${alertColor}--text`">{{ entry.title }}</span>
                </div>
                <p
                    class="notification-menu-entry__description text-body-2 mb-0 text--disabled font-weight-light"
                    v-html="formatedText" />
                <v-btn
                    v-if="entryType === 'maintenance'"
                    outlined
                    small
                    :color="alertColor"
                    class="mt-3 mb-0 w-100"
                    @click="showMaintenanceDetails = true">
                    {{ $t('App.Notifications.ShowDetails') }}
                </v-btn>
            </v-col>
            <v-col
                v-if="entry.priority !== 'critical'"
                class="shrink pl-0 pb-1 pt-1 pr-2 d-flex flex-column align-self-stretch justify-space-between">
                <v-btn
                    v-if="entryType !== 'maintenance'"
                    icon
                    plain
                    :color="alertColor"
                    class="mb-2"
                    @click="xButtonAction">
                    <v-icon>{{ mdiClose }}</v-icon>
                </v-btn>
                <v-spacer />
                <v-btn icon plain retain-focus-on-click :color="alertColor" @click="expand = !expand">
                    <v-icon>{{ mdiBellOffOutline }}</v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row v-if="entry.priority !== 'critical'">
            <v-expand-transition>
                <div v-show="expand" class="pt-1 w-100">
                    <v-divider class="pb-1 ml-2" />
                    <div class="text-right py-1" style="font-size: 0.875rem">
                        <span class="text--disabled text-caption font-weight-light">
                            {{ $t('App.Notifications.Remind') }}
                        </span>
                        <v-btn
                            v-for="reminder in reminderTimes"
                            :key="reminder.text"
                            :color="alertColor"
                            x-small
                            plain
                            text
                            outlined
                            class="mx-1"
                            @click="reminder.clickFunction">
                            {{ reminder.text }}
                        </v-btn>
                    </div>
                </div>
            </v-expand-transition>
        </v-row>
        <history-list-panel-detail-maintenance
            v-if="entryType === 'maintenance'"
            :show="showMaintenanceDetails"
            :item="maintenanceEntry"
            @close="showMaintenanceDetails = false" />
    </v-alert>
</template>

<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { mdiClose, mdiLinkVariant, mdiBellOffOutline } from '@mdi/js'
import { GuiNotificationStateEntry } from '@/store/gui/notifications/types'
import { TranslateResult } from 'vue-i18n'
import { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'

interface ReminderOption {
    text: string | TranslateResult
    clickFunction: Function
}

@Component({
    components: {},
})
export default class NotificationMenuEntry extends Mixins(BaseMixin) {
    mdiClose = mdiClose
    mdiLinkVariant = mdiLinkVariant
    mdiBellOffOutline = mdiBellOffOutline

    expand = false
    showMaintenanceDetails = false

    @Prop({ required: true })
    declare readonly entry: GuiNotificationStateEntry

    @Prop({ default: true })
    declare readonly parentState: boolean

    get formatedText() {
        return this.entry.description.replace(
            /(\bhttps?:\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gim,
            '<a href="$1" target="_blank" class="' + this.alertColor + '--text">$1</a>'
        )
    }

    get alertColor() {
        if (this.entry.priority === 'critical') return 'error'
        if (this.entry.priority === 'high') return 'warning'

        return 'info'
    }

    get entryType() {
        const posFirstSlash = this.entry.id.indexOf('/')
        if (posFirstSlash === -1) return ''

        return this.entry.id.slice(0, posFirstSlash)
    }

    get maintenanceEntry() {
        if (this.entryType !== 'maintenance') return null

        const id = this.entry.id.replace('maintenance/', '')
        const entries = this.$store.getters['gui/maintenance/getEntries']

        return entries.find((entry: GuiMaintenanceStateEntry) => entry.id === id)
    }

    get reminderTimes() {
        let output: ReminderOption[] = [
            {
                text: this.$t('App.Notifications.NextReboot'),
                clickFunction: () => this.dismiss('reboot', null),
            },
            { text: this.$t('App.Notifications.Never'), clickFunction: () => this.close() },
        ]

        if (['announcement', 'maintenance'].includes(this.entryType)) {
            output = []
            output.push({
                text: this.$t('App.Notifications.OneHourShort'),
                clickFunction: () => this.dismiss('time', 60 * 60),
            })
            output.push({
                text: this.$t('App.Notifications.OneDayShort'),
                clickFunction: () => this.dismiss('time', 60 * 60 * 24),
            })
            output.push({
                text: this.$t('App.Notifications.OneWeekShort'),
                clickFunction: () => this.dismiss('time', 60 * 60 * 24 * 7),
            })
        }

        return output
    }

    xButtonAction() {
        if (this.entryType === 'announcement') return this.close()

        this.dismiss('reboot', null)
    }

    close() {
        this.$store.dispatch('gui/notifications/close', { id: this.entry.id })
    }

    dismiss(type: 'time' | 'reboot', time: number | null) {
        this.$store.dispatch('gui/notifications/dismiss', { id: this.entry.id, type, time })
    }

    @Watch('parentState')
    parentStateUpdate(newVal: boolean) {
        if (!newVal) this.expand = false
    }
}
</script>

<style scoped>
.notification-menu-entry__headline {
    line-height: 1.2;
    overflow-wrap: anywhere;
}

.notification-menu-entry__description {
    max-width: 292px;
    overflow-wrap: anywhere;
}

.notification-menu-entry--priority-critical .notification-menu-entry__description {
    max-width: 336px;
}
</style>
