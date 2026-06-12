<template>
    <v-alert :class="`notification-menu-entry--priority-${entry.priority}`" text :color="alertColor" border="left">
        <v-row align="start" class="flex-nowrap">
            <v-col class="grow pb-2">
                <div class="notification-menu-entry__headline mb-1 text-subtitle-1">
                    <a
                        v-if="'url' in entry"
                        :class="`text-decoration-none text-${alertColor} `"
                        :href="entry.url"
                        target="_blank">
                        <v-icon small :class="`text-${alertColor} pb-1`">
                            {{ mdiLinkVariant }}
                        </v-icon>
                        {{ entry.title }}
                    </a>
                    <span v-else :class="`text-${alertColor}`">{{ entry.title }}</span>
                </div>
                <p
                    class="notification-menu-entry__description text-body-2 mb-0 text-disabled font-weight-light"
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
                    :icon="mdiClose"
                    plain
                    :color="alertColor"
                    class="mb-2"
                    @click="xButtonAction" />
                <v-spacer />
                <v-btn :icon="mdiBellOffOutline" plain retain-focus-on-click :color="alertColor" @click="expand = !expand" />
            </v-col>
        </v-row>
        <v-row v-if="entry.priority !== 'critical'">
            <v-expand-transition>
                <div v-show="expand" class="pt-1 w-100">
                    <v-divider class="pb-1 ml-2" />
                    <div class="text-right py-1" style="font-size: 0.875rem">
                        <span class="text-disabled text-caption font-weight-light">
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
            v-model="showMaintenanceDetails"
            :item="maintenanceEntry" />
    </v-alert>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { mdiClose, mdiLinkVariant, mdiBellOffOutline } from '@mdi/js'
import { GuiNotificationStateEntry } from '@/store/gui/notifications/types'
import { TranslateResult } from 'vue-i18n'
import { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'

interface ReminderOption {
    text: string | TranslateResult
    clickFunction: () => void
}

const { t } = useI18n()
const store = useStore()

const props = defineProps<{
    entry: GuiNotificationStateEntry
    parentState?: boolean
}>()

const expand = ref(false)
const showMaintenanceDetails = ref(false)

const formatedText = computed(() =>
    props.entry.description.replace(
        /(\bhttps?:\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gim,
        '<a href="$1" target="_blank" class="' + alertColor.value + '--text">$1</a>'
    )
)

const alertColor = computed(() => {
    if (props.entry.priority === 'critical') return 'error'
    if (props.entry.priority === 'high') return 'warning'

    return 'info'
})

const entryType = computed(() => {
    const posFirstSlash = props.entry.id.indexOf('/')
    if (posFirstSlash === -1) return ''

    return props.entry.id.slice(0, posFirstSlash)
})

const maintenanceEntry = computed(() => {
    if (entryType.value !== 'maintenance') return null

    const id = props.entry.id.replace('maintenance/', '')
    const entries = store.getters['gui/maintenance/getEntries']

    return entries.find((entry: GuiMaintenanceStateEntry) => entry.id === id)
})

const reminderTimes = computed(() => {
    let output: ReminderOption[] = [
        {
            text: t('App.Notifications.NextReboot'),
            clickFunction: () => dismiss('reboot', null),
        },
        { text: t('App.Notifications.Never'), clickFunction: () => close() },
    ]

    if (['announcement', 'maintenance'].includes(entryType.value)) {
        output = []
        output.push({
            text: t('App.Notifications.OneHourShort'),
            clickFunction: () => dismiss('time', 60 * 60),
        })
        output.push({
            text: t('App.Notifications.OneDayShort'),
            clickFunction: () => dismiss('time', 60 * 60 * 24),
        })
        output.push({
            text: t('App.Notifications.OneWeekShort'),
            clickFunction: () => dismiss('time', 60 * 60 * 24 * 7),
        })
    }

    return output
})

function xButtonAction() {
    if (entryType.value === 'announcement') return close()

    dismiss('reboot', null)
}

function close() {
    store.dispatch('gui/notifications/close', { id: props.entry.id })
}

function dismiss(type: 'time' | 'reboot', time: number | null) {
    store.dispatch('gui/notifications/dismiss', { id: props.entry.id, type, time })
}

watch(() => props.parentState, (newVal: boolean) => {
    if (!newVal) expand.value = false
})
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
