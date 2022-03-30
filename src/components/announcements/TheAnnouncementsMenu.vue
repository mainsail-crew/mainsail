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
                            <announcement-menu-entry
                                :key="entry.entry_id"
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
                    <span class="text-disabled">{{ $t('App.Announcements.NoAnnouncement') }}</span>
                </v-card-text>
            </template>
        </v-card>
    </v-menu>
</template>

<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import { Component, Mixins } from 'vue-property-decorator'
import AnnouncementMenuEntry from '@/components/announcements/AnnouncementMenuEntry.vue'
import { mdiBell, mdiBellOutline, mdiCloseBoxMultipleOutline } from '@mdi/js'

@Component({
    components: { AnnouncementMenuEntry },
})
export default class TheAnnouncementsMenu extends Mixins(BaseMixin) {
    mdiBell = mdiBell
    mdiBellOutline = mdiBellOutline
    mdiCloseBoxMultipleOutline = mdiCloseBoxMultipleOutline

    get notifications() {
        return this.$store.getters['notification/getNotifications'] ?? []
    }

    get existsCriticalAnnouncements() {
        //return this.announcements.filter((entry: ServerAnnouncementsStateEntry) => entry.priority === 'high').length > 0

        return false
    }

    get colorBadge() {
        return this.existsCriticalAnnouncements ? 'warning' : 'primary'
    }

    dismissAll() {
        /*this.announcements.forEach((entry: ServerAnnouncementsStateEntry) => {
            this.$store.dispatch('server/announcements/close', { entry_id: entry.entry_id })
        })*/
    }
}
</script>

<style scoped>
.announcement-menu__scrollbar {
    max-height: 500px;
}
</style>
