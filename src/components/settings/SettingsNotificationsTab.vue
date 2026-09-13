<template>
    <div>
        <v-card flat>
            <v-card-text>
                <div class="d-flex align-center">
                    <v-icon style="opacity: 0.7">{{ mdiBellRing }}</v-icon>
                    <v-card-title class="mx-n2">
                        {{ $t('Settings.NotificationsTab.Notifications') }}
                    </v-card-title>
                    <v-divider class="ml-3" />
                </div>
                <v-alert v-if="unavailableReason" dense text type="info" class="mb-0 mt-3">
                    {{ unavailableReason }}
                </v-alert>
                <template v-else>
                    <settings-row
                        :title="$t('Settings.NotificationsTab.TestNotification')"
                        :sub-title="$t('Settings.NotificationsTab.TestNotificationDescription')">
                        <v-btn small outlined @click="sendTestNotification">
                            {{ $t('Settings.NotificationsTab.SendTest') }}
                        </v-btn>
                    </settings-row>
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.NotificationsTab.PublicKey')"
                        :sub-title="$t('Settings.NotificationsTab.PublicKeyDescription')"
                        :mobile-second-row="true">
                        <v-text-field
                            v-model="vapidPublicKey"
                            :placeholder="$t('Settings.NotificationsTab.PublicKeyPlaceholder')"
                            :disabled="enabled || loading"
                            hide-details
                            outlined
                            dense />
                    </settings-row>
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.NotificationsTab.Enable')"
                        :sub-title="enableDescription"
                        :loading="loading">
                        <v-switch
                            v-model="enabled"
                            hide-details
                            class="mt-0"
                            :disabled="loading"
                            @change="onEnabledChanged" />
                    </settings-row>
                    <template v-if="hasProgressMacro">
                        <v-divider class="my-2" />
                        <settings-row
                            :title="$t('Settings.NotificationsTab.Progress')"
                            :sub-title="$t('Settings.NotificationsTab.ProgressDescription')"
                            :mobile-second-row="true">
                            <v-select v-model="progressInterval" :items="progressOptions" hide-details outlined dense />
                        </settings-row>
                    </template>
                    <template v-if="hasRunoutMacro">
                        <h3 class="text-h5 mb-3 mt-6">{{ $t('Settings.NotificationsTab.Runout') }}</h3>
                        <p class="mb-3 text--secondary runout-hint">
                            {{ $t('Settings.NotificationsTab.RunoutDescription') }}
                        </p>
                        <template v-if="availableRunoutSensors.length">
                            <template v-for="(sensor, index) in availableRunoutSensors">
                                <v-divider v-if="index" :key="'runout_divider_' + sensor" class="my-2" />
                                <settings-row :key="sensor" :title="convertName(sensor)" :dynamic-slot-width="true">
                                    <v-switch
                                        :input-value="isRunoutSensorEnabled(sensor)"
                                        hide-details
                                        class="mt-0"
                                        @change="setRunoutSensor(sensor, $event)" />
                                </settings-row>
                            </template>
                        </template>
                        <p v-else class="mb-0 text-center font-italic">
                            {{ $t('Settings.NotificationsTab.RunoutNoSensors') }}
                        </p>
                    </template>
                </template>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiBellRing } from '@mdi/js'
import { sha256 } from 'js-sha256'
import { convertName } from '@/plugins/helpers'
import axios from 'axios'
import {
    getSubscription,
    isNotificationSupported,
    isPushSupported,
    isStandalone,
    subscribe,
    toSubscriptionJson,
    unsubscribe,
    WebPushSubscriptionJson,
} from '@/plugins/webpush'

const deviceNameStorageKey = 'mainsail.push.deviceName'

@Component({
    components: {
        Panel,
        SettingsRow,
    },
})
export default class SettingsNotificationsTab extends Mixins(BaseMixin) {
    mdiBellRing = mdiBellRing

    convertName = convertName

    loading = false
    enabled = false
    subscription: WebPushSubscriptionJson | null = null
    deviceNameValue = ''

    async mounted() {
        const stored = localStorage.getItem(deviceNameStorageKey)
        // persist the generated name straight away, otherwise a new one is made
        // on every mount and stops matching the entry written to the printer
        if (stored === null) this.deviceName = this.defaultDeviceName
        else this.deviceNameValue = stored

        await this.refreshSubscription()
    }

    /**
     * Never shown in the UI -- it only keys this device's entry in the
     * subscription file, so it just has to be readable there and unique.
     */
    get defaultDeviceName() {
        const agent = navigator.userAgent
        const platform = [
            ['iphone', /iPhone/i],
            ['ipad', /iPad/i],
            ['android', /Android/i],
            ['mac', /Macintosh/i],
            ['windows', /Windows/i],
            ['linux', /Linux/i],
        ].find(([, pattern]) => (pattern as RegExp).test(agent))

        return `${platform?.[0] ?? 'browser'}-${Math.random().toString(36).slice(2, 8)}`
    }

    /**
     * Push is unavailable rather than broken in a few normal situations, each of
     * which needs a different hint to the user.
     */
    get unavailableReason() {
        if (!window.isSecureContext) return this.$t('Settings.NotificationsTab.NeedsSecureContext')

        // iOS exposes PushManager only once the app is on the home screen
        if (!isPushSupported() && !isStandalone()) return this.$t('Settings.NotificationsTab.NeedsInstall')

        if (!isPushSupported() || !isNotificationSupported()) return this.$t('Settings.NotificationsTab.NotSupported')

        return null
    }

    get enableDescription() {
        if (this.vapidPublicKey === '') return this.$t('Settings.NotificationsTab.NeedsPublicKey')

        return this.$t('Settings.NotificationsTab.EnableDescription')
    }

    get vapidPublicKey(): string {
        return this.$store.state.gui.push?.vapidPublicKey ?? ''
    }

    set vapidPublicKey(newVal: string) {
        this.$store.dispatch('gui/push/saveSetting', { name: 'vapidPublicKey', value: newVal.trim() })
    }

    /**
     * Both of these settings are driven by printer-side macros, which Mainsail
     * does not ship. Hiding the controls when the macros are absent keeps them
     * from writing save variables that nothing would ever read.
     */
    get hasProgressMacro(): boolean {
        return 'gcode_macro _NOTIFY_PROGRESS_VARS' in (this.$store.state.printer ?? {})
    }

    get hasRunoutMacro(): boolean {
        return 'gcode_macro _NOTIFY_RUNOUT_VARS' in (this.$store.state.printer ?? {})
    }

    get progressOptions() {
        return [
            { text: this.$t('Settings.NotificationsTab.ProgressEvery', { percent: 10 }), value: 10 },
            { text: this.$t('Settings.NotificationsTab.ProgressEvery', { percent: 25 }), value: 25 },
            { text: this.$t('Settings.NotificationsTab.ProgressEvery', { percent: 50 }), value: 50 },
            { text: this.$t('Settings.NotificationsTab.ProgressComplete'), value: 100 },
        ]
    }

    get progressInterval(): number {
        return this.$store.state.gui.push?.progressInterval ?? 25
    }

    set progressInterval(newVal: number) {
        this.$store.dispatch('gui/push/saveSetting', { name: 'progressInterval', value: newVal })
        // the printer-side macro reads this from save_variables, so that
        // progress notifications keep working with no browser open
        this.$store.dispatch('printer/sendGcode', `SAVE_VARIABLE VARIABLE=notify_progress_interval VALUE=${newVal}`)
    }

    get availableRunoutSensors(): string[] {
        const printer = this.$store.state.printer ?? {}

        return (
            Object.keys(printer)
                .filter((key) => key.startsWith('filament_switch_sensor ') || key.startsWith('filament_motion_sensor '))
                .map((key) => key.split(' ').slice(1).join(' '))
                // numeric-aware, or mmu_entry_10 sorts between _1 and _2
                .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        )
    }

    get runoutSensors(): string[] {
        return this.$store.state.gui.push?.runoutSensors ?? []
    }

    isRunoutSensorEnabled(name: string): boolean {
        return this.runoutSensors.includes(name)
    }

    /**
     * Watched sensors go to the printer as a comma-separated string, so a
     * printer-side macro can poll them with no browser open. Each is latched
     * separately there, which matters on an MMU where unused gates read empty.
     */
    setRunoutSensor(name: string, value: boolean | null) {
        const current = this.runoutSensors.filter((sensor) => sensor !== name)
        const next = value === true ? [...current, name].sort() : current

        this.$store.dispatch('gui/push/saveSetting', { name: 'runoutSensors', value: next })
        // klipper strips one level of quotes before ast.literal_eval, so the
        // value has to arrive with its quotes escaped
        this.$store.dispatch(
            'printer/sendGcode',
            `SAVE_VARIABLE VARIABLE=notify_runout_sensors VALUE=\\"${next.join(',')}\\"`
        )
    }

    get subscriptionPath(): string {
        return this.$store.state.gui.push?.subscriptionPath ?? 'webpush/subscriptions.json'
    }

    get deviceName(): string {
        return this.deviceNameValue
    }

    set deviceName(newVal: string) {
        this.deviceNameValue = newVal
        localStorage.setItem(deviceNameStorageKey, newVal)
    }

    async refreshSubscription() {
        const subscription = await getSubscription()
        this.subscription = subscription === null ? null : toSubscriptionJson(subscription)
        this.enabled = this.subscription !== null
    }

    /**
     * The v-switch writes `enabled` directly, so react to the change instead of
     * using a setter -- Safari only shows the permission prompt when
     * requestPermission() is reached from the click without an await in front.
     */
    async onEnabledChanged(newVal: boolean) {
        if (!newVal) {
            try {
                await unsubscribe()
                this.subscription = null
            } catch (error: unknown) {
                // the browser kept the subscription, but dropping this device
                // from the printer is what actually stops the notifications
                window.console.error('unsubscribing failed:', error)
                this.$toast.error(this.$t('Settings.NotificationsTab.UnsubscribeFailed').toString())
            }

            await this.removeFromPrinter()

            return
        }

        if (this.vapidPublicKey === '') {
            this.enabled = false
            this.$toast.error(this.$t('Settings.NotificationsTab.NeedsPublicKey').toString())
            return
        }

        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
            this.enabled = false
            this.$toast.error(this.$t('Settings.NotificationsTab.PermissionDenied').toString())
            return
        }

        this.loading = true
        try {
            const subscription = await subscribe(this.vapidPublicKey)
            this.subscription = toSubscriptionJson(subscription)
        } catch (error: unknown) {
            window.console.error('push subscribe failed:', error)
            await this.rollbackSubscription('SubscribeFailed')

            return
        } finally {
            this.loading = false
        }

        // save straight away -- a subscription the printer does not know about
        // receives nothing, and a separate step is easy to miss
        try {
            await this.saveToPrinter()
        } catch (error: unknown) {
            window.console.error('saving the subscription failed:', error)
            await this.rollbackSubscription('SaveFailed')
        }
    }

    /**
     * Leaves nothing half-enabled: a browser subscription the printer does not
     * know about receives nothing, and would silently look like it works.
     */
    async rollbackSubscription(message: string) {
        try {
            await unsubscribe()
        } catch (error: unknown) {
            window.console.error('rolling back the subscription failed:', error)
        }

        this.subscription = null
        this.enabled = false
        this.$toast.error(this.$t(`Settings.NotificationsTab.${message}`).toString())
    }

    async sendTestNotification() {
        const registration = await navigator.serviceWorker.ready
        await registration.showNotification(this.$t('Settings.NotificationsTab.TestTitle').toString(), {
            body: this.$t('Settings.NotificationsTab.TestBody').toString(),
            icon: '/img/icons/icon-192.png',
            badge: '/img/icons/icon-192-maskable.png',
            tag: 'mainsail-test',
        })
    }

    get configPath(): string {
        return this.subscriptionPath.replace(/^\/+/, '')
    }

    /**
     * Reads the subscription file from the config root. A missing file is the
     * normal first-run case, so it resolves to an empty set rather than failing.
     */
    async readSubscriptions(): Promise<Record<string, WebPushSubscriptionJson>> {
        try {
            const response = await axios.get(`${this.apiUrl}/server/files/config/${this.configPath}`, {
                params: { date: Date.now() },
            })
            if (response.data && typeof response.data === 'object') return response.data

            return {}
        } catch (error: unknown) {
            // only a missing file means "no subscriptions yet". Treating any
            // other failure as empty would write this device over the top of
            // every other one already in the file
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                window.console.debug('no existing subscription file, starting a new one')

                return {}
            }

            throw error
        }
    }

    async writeSubscriptions(subscriptions: Record<string, WebPushSubscriptionJson>) {
        const content = JSON.stringify(subscriptions, null, 4)
        const filename = this.configPath.split('/').pop() ?? 'subscriptions.json'
        const directory = this.configPath.split('/').slice(0, -1).join('/')

        const formData = new FormData()
        formData.append('file', new Blob([content], { type: 'application/json' }), filename)
        formData.append('root', 'config')
        formData.append('path', directory)
        formData.append('checksum', sha256(content))

        await axios.post(`${this.apiUrl}/server/files/upload`, formData)
    }

    /**
     * Merges this device into the subscription file, so that other devices
     * already listed there keep receiving notifications.
     */
    async saveToPrinter() {
        if (this.subscription === null) {
            this.$toast.error(this.$t('Settings.NotificationsTab.NoSubscription').toString())
            return
        }

        const subscriptions = await this.readSubscriptions()
        subscriptions[this.deviceName] = this.subscription
        await this.writeSubscriptions(subscriptions)
        this.$toast.success(this.$t('Settings.NotificationsTab.Saved', { path: this.configPath }).toString())
    }

    /**
     * Drops this device from the subscription file so the printer stops sending
     * to an endpoint that no longer accepts anything.
     */
    async removeFromPrinter() {
        try {
            const subscriptions = await this.readSubscriptions()
            if (!(this.deviceName in subscriptions)) return

            delete subscriptions[this.deviceName]
            await this.writeSubscriptions(subscriptions)
        } catch (error: unknown) {
            window.console.error('removing the subscription failed:', error)
        }
    }
}
</script>

<style scoped>
.runout-hint {
    font-size: 0.8em;
    line-height: 1.3;
}
</style>
