<template>
    <v-alert :class="`notification-menu-entry--priority-${entry.priority}`" text :color="alertColor" border="left">
        <v-row align="start">
            <v-col class="grow">
                <div class="notification-menu-entry__headline mb-1 text-subtitle-1">
                    <template v-if="'url' in entry">
                        <a :class="`text-decoration-none ${alertColor}--text`" :href="entry.url" target="_blank">
                            <v-icon small :class="`${alertColor}--text pb-1`">
                                {{ mdiLinkVariant }}
                            </v-icon>
                            {{ entry.title }}
                        </a>
                    </template>
                    <template v-else>
                        <span :class="`${alertColor}--text`">{{ entry.title }}</span>
                    </template>
                </div>
                <p
                    class="notification-menu-entry__description text-body-2 mb-0 text--disabled font-weight-light"
                    v-html="formatedText"></p>
            </v-col>
            <v-col
                v-if="entry.priority !== 'critical'"
                class="shrink pl-0 pb-0 pt-1 pr-2 d-flex flex-column align-self-stretch justify-space-between">
                <v-btn v-if="entryType === 'announcement'" icon plain :color="alertColor" class="mb-2" @click="close">
                    <v-icon>{{ mdiClose }}</v-icon>
                </v-btn>
                <v-btn v-else icon plain :color="alertColor" class="mb-2" @click="dismiss('reboot', null)">
                    <v-icon>{{ mdiClose }}</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn icon plain retain-focus-on-click :color="alertColor" class="pb-1" @click="expand = !expand">
                    <v-icon>{{ mdiBellOffOutline }}</v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row v-if="entry.priority !== 'critical'">
            <v-expand-transition>
                <div v-show="expand" class="pt-1" style="width: 100%">
                    <v-divider class="pb-1 ml-2"></v-divider>
                    <div class="text-right py-1" style="font-size: 0.875rem">
                        <span class="text--disabled text-caption font-weight-light">
                            {{ $t('App.Notifications.Remind') }}
                        </span>
                        <template v-if="entryType === 'announcement'">
                            <v-btn
                                :color="alertColor"
                                x-small
                                plain
                                text
                                outlined
                                class="mx-1"
                                @click="dismiss('time', 60 * 60)">
                                1H
                            </v-btn>
                            <v-btn
                                :color="alertColor"
                                x-small
                                plain
                                text
                                outlined
                                class="mx-1"
                                @click="dismiss('time', 60 * 60 * 24)">
                                1D
                            </v-btn>
                            <v-btn
                                :color="alertColor"
                                x-small
                                plain
                                text
                                outlined
                                class="mx-1"
                                @click="dismiss('time', 60 * 60 * 24 * 7)">
                                7D
                            </v-btn>
                        </template>
                        <template v-else>
                            <v-btn
                                :color="alertColor"
                                x-small
                                plain
                                text
                                outlined
                                class="mx-1"
                                @click="dismiss('reboot', null)">
                                {{ $t('App.Notifications.NextReboot') }}
                            </v-btn>
                            <v-btn :color="alertColor" x-small plain text outlined class="mx-1" @click="close">
                                {{ $t('App.Notifications.Never') }}
                            </v-btn>
                        </template>
                    </div>
                </div>
            </v-expand-transition>
        </v-row>
    </v-alert>
</template>

<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { mdiClose, mdiLinkVariant, mdiBellOffOutline } from '@mdi/js'
import { GuiNotificationStateEntry } from '@/store/gui/notifications/types'

@Component({
    components: {},
})
export default class NotificationMenuEntry extends Mixins(BaseMixin) {
    mdiClose = mdiClose
    mdiLinkVariant = mdiLinkVariant
    mdiBellOffOutline = mdiBellOffOutline

    private expand = false

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
}

.notification-menu-entry__description {
    max-width: 292px;
}

.notification-menu-entry--priority-critical .notification-menu-entry__description {
    max-width: 336px;
}
</style>
