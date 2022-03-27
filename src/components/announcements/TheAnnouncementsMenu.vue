<template>
    <v-menu bottom left offset-y :close-on-click="false" origin="center center" transition="scale-transition">
        <template #activator="{ on, attrs }">
            <v-btn icon tile class="minwidth-0" v-bind="attrs" v-on="on">
                <v-badge
                    :content="announcements.length"
                    :value="announcements.length > 0"
                    color="primary"
                    overlap
                    bordered>
                    <v-icon>{{ mdiBellOutline }}</v-icon>
                </v-badge>
            </v-btn>
        </template>
        <v-card flat :max-width="400">
            <v-card-text>
                <template v-for="(entry, index) in announcements">
                    <announcement-menu-entry
                        :key="entry.entry_id"
                        :entry="entry"
                        :class="index < announcements.length - 1 ? '' : 'mb-0'" />
                </template>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text color="primary" class="mr-2" @click="dismissAll">
                    <v-icon left>{{ mdiNotificationClearAll }}</v-icon>
                    Close all
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-menu>
</template>

<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import { Component, Mixins } from 'vue-property-decorator'
import AnnouncementMenuEntry from '@/components/announcements/AnnouncementMenuEntry.vue'
import { mdiBellOutline, mdiNotificationClearAll } from '@mdi/js'

@Component({
    components: { AnnouncementMenuEntry },
})
export default class TheAnnouncementsMenu extends Mixins(BaseMixin) {
    mdiBellOutline = mdiBellOutline
    mdiNotificationClearAll = mdiNotificationClearAll

    get announcements() {
        return this.$store.getters['server/announcements/getNormal']
    }

    dismissAll() {
        window.console.log('dismissAll')
    }
}
</script>

<style scoped></style>
