<template>
    <v-menu
        bottom
        left
        offset-y
        :close-on-click="true"
        :close-on-content-click="false"
        origin="center center"
        transition="slide-y-transition">
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
        <v-card flat :min-width="300" :max-width="400">
            <template v-if="notifications.length">
                <overlay-scrollbars class="announcement-menu__scrollbar">
                    <v-card-text>
                        <template v-for="(entry, index) in notifications">
                            <notification-menu-entry
                                :key="entry.id"
                                :entry="entry"
                                :class="index < notifications.length - 1 ? '' : 'mb-0'" />
                        </template>
                    </v-card-text>
                </overlay-scrollbars>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" class="mr-2" @click="dismissAll">
                        <v-icon left>{{ mdiCloseBoxMultipleOutline }}</v-icon>
                        Dismiss all
                    </v-btn>
                </v-card-actions>
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
import { NotificationStateEntry } from '@/store/gui/notifications/types'

@Component({
    components: { NotificationMenuEntry },
})
export default class TheNotificationMenu extends Mixins(BaseMixin) {
    mdiBell = mdiBell
    mdiBellOutline = mdiBellOutline
    mdiCloseBoxMultipleOutline = mdiCloseBoxMultipleOutline

    get notifications() {
        return this.$store.getters['notification/getNotifications'] ?? []
    }

    get existsCriticalAnnouncements() {
        return this.notifications.filter((entry: NotificationStateEntry) => entry.priority === 'critical').length > 0
    }

    get existsHighAnnouncements() {
        return this.notifications.filter((entry: NotificationStateEntry) => entry.priority === 'high').length > 0
    }

    get colorBadge() {
        if (this.existsCriticalAnnouncements) return 'error'
        if (this.existsHighAnnouncements) return 'warning'

        return 'primary'
    }

    dismissAll() {
        /*this.notifications.forEach((entry: ServerAnnouncementsStateEntry) => {
            this.$store.dispatch('server/notifications/close', { entry_id: entry.entry_id })
        })*/
    }
}
</script>

<style scoped>
.announcement-menu__scrollbar {
    max-height: 500px;
}
</style>
