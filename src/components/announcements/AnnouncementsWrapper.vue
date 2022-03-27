<template>
    <announcement-snackbar v-if="criticalAnnouncement" :entry="criticalAnnouncement" />
</template>

<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import { Component, Mixins } from 'vue-property-decorator'
import AnnouncementSnackbar from '@/components/announcements/AnnouncementSnackbar.vue'
import { ServerAnnouncementsStateEntry } from '@/store/server/announcements/types'

@Component({
    components: { AnnouncementSnackbar },
})
export default class AnnouncementsWrapper extends Mixins(BaseMixin) {
    get criticalAnnouncement() {
        let entries = this.$store.state.server?.announcements?.entries ?? []

        entries = entries
            .filter((entry: ServerAnnouncementsStateEntry) => {
                if (entry.priority === 'normal') return false

                return !entry.dismissed
            })
            .sort(
                (a: ServerAnnouncementsStateEntry, b: ServerAnnouncementsStateEntry) =>
                    b.date.getTime() - a.date.getTime()
            )

        return entries.length > 0 ? entries.shift() : null
    }
}
</script>

<style scoped></style>
