<template>
    <v-menu
        v-model="boolMenu"
        bottom
        :left="!isMobile"
        offset-y
        :close-on-click="true"
        :close-on-content-click="false"
        origin="center center"
        transition="slide-y-transition"
        :min-width="isMobile ? '100%' : null">
        <template #activator="{ on, attrs }">
            <v-btn icon tile class="minwidth-0" v-bind="attrs" v-on="on">
                <v-badge
                    :content="notifications.length <= 9 ? notifications.length : '9+'"
                    :value="notifications.length > 0"
                    :color="colorBadge"
                    overlap>
                    <v-icon>{{ attrs['aria-expanded'] === 'false' ? mdiBellOutline : mdiBell }}</v-icon>
                </v-badge>
            </v-btn>
        </template>
        <v-card flat :min-width="300" :max-width="isMobile ? null : 400">
            <template v-if="notifications.length">
                <overlay-scrollbars class="announcement-menu__scrollbar">
                    <v-card-text>
                        <template v-for="(entry, index) in notifications">
                            <notification-menu-entry
                                :key="entry.id"
                                :entry="entry"
                                :class="index < notifications.length - 1 ? '' : 'mb-0'"
                                :parent-state="boolMenu" />
                        </template>
                    </v-card-text>
                </overlay-scrollbars>
                <template v-if="notifications.length > 1">
                    <v-divider></v-divider>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" class="mr-2" @click="dismissAll">
                            <v-icon left>{{ mdiCloseBoxMultipleOutline }}</v-icon>
                            {{ $t('App.Notifications.DismissAll') }}
                        </v-btn>
                    </v-card-actions>
                </template>
            </template>
            <template v-else>
                <v-card-text class="text-center">
                    <span class="text-disabled">{{ $t('App.Notifications.NoNotification') }}</span>
                </v-card-text>
            </template>
        </v-card>
    </v-menu>
</template>

<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import { Component, Mixins } from 'vue-property-decorator'
import NotificationMenuEntry from '@/components/notifications/NotificationMenuEntry.vue'
import { mdiBell, mdiBellOutline, mdiCloseBoxMultipleOutline } from '@mdi/js'
import { GuiNotificationStateEntry } from '@/store/gui/notifications/types'

@Component({
    components: { NotificationMenuEntry },
})
export default class TheNotificationMenu extends Mixins(BaseMixin) {
    mdiBell = mdiBell
    mdiBellOutline = mdiBellOutline
    mdiCloseBoxMultipleOutline = mdiCloseBoxMultipleOutline

    private boolMenu = false

    get notifications() {
        return this.$store.getters['gui/notifications/getNotifications'] ?? []
    }

    get existsCriticalAnnouncements() {
        return this.notifications.filter((entry: GuiNotificationStateEntry) => entry.priority === 'critical').length > 0
    }

    get existsHighAnnouncements() {
        return this.notifications.filter((entry: GuiNotificationStateEntry) => entry.priority === 'high').length > 0
    }

    get countNormalAnnouncements() {
        return this.notifications.filter((entry: GuiNotificationStateEntry) => entry.priority === 'normal').length
    }

    get colorBadge() {
        if (this.existsCriticalAnnouncements) return 'error'
        if (this.existsHighAnnouncements) return 'warning'

        return 'primary'
    }

    dismissAll() {
        this.notifications.forEach(async (entry: GuiNotificationStateEntry) => {
            if (entry.id.startsWith('announcement')) {
                await this.$store.dispatch('gui/notifications/close', { id: entry.id })
            } else {
                await this.$store.dispatch('gui/notifications/dismiss', { id: entry.id, type: 'reboot', time: null })
            }
        })
    }
}
</script>

<style scoped>
.announcement-menu__scrollbar {
    max-height: 500px;
}
</style>
