<template>
    <v-menu
        bottom
        left
        offset-y
        :close-on-click="true"
        :close-on-content-click="false"
        origin="center center"
        transition="scale-transition">
        <template #activator="{ on, attrs }">
            <v-btn icon tile class="minwidth-0" v-bind="attrs" v-on="on">
                <v-badge :content="announcements.length" :value="announcements.length > 0" :color="colorBadge" overlap>
                    <v-icon>{{ mdiBellOutline }}</v-icon>
                </v-badge>
            </v-btn>
        </template>
        <v-card flat :min-width="300" :max-width="400">
            <template v-if="announcements.length">
                <overlay-scrollbars class="announcement-menu__scrollbar">
                    <v-card-text>
                        <template v-for="(entry, index) in announcements">
                            <announcement-menu-entry
                                :key="entry.entry_id"
                                :entry="entry"
                                :class="index < announcements.length - 1 ? '' : 'mb-0'" />
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
import { mdiBellOutline, mdiCloseBoxMultipleOutline } from '@mdi/js'
import { ServerAnnouncementsStateEntry } from '@/store/server/announcements/types'

@Component({
    components: { AnnouncementMenuEntry },
})
export default class TheAnnouncementsMenu extends Mixins(BaseMixin) {
    mdiBellOutline = mdiBellOutline
    mdiCloseBoxMultipleOutline = mdiCloseBoxMultipleOutline

    get announcements() {
        return this.$store.getters['server/announcements/getAll']
    }

    get existsCriticalAnnouncements() {
        return this.announcements.filter((entry: ServerAnnouncementsStateEntry) => entry.priority === 'high').length > 0
    }

    get colorBadge() {
        return this.existsCriticalAnnouncements ? 'error' : 'primary'
    }

    dismissAll() {
        this.announcements.forEach((entry: ServerAnnouncementsStateEntry) => {
            this.$store.dispatch('server/announcements/close', { entry_id: entry.entry_id })
        })
    }
}
</script>

<style scoped>
.announcement-menu__scrollbar {
    max-height: 500px;
}
</style>
