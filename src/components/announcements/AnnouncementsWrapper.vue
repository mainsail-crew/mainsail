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
        return this.$store.getters['server/announcements/getFirstCritical']
    }
}
</script>

<style scoped></style>
