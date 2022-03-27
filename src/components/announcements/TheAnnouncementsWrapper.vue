<template>
    <announcement-snackbar v-if="criticalAnnouncement" :entry="criticalAnnouncement" />
</template>

<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import { Component, Mixins } from 'vue-property-decorator'
import AnnouncementSnackbar from '@/components/announcements/AnnouncementSnackbar.vue'

@Component({
    components: { AnnouncementSnackbar },
})
export default class TheAnnouncementsWrapper extends Mixins(BaseMixin) {
    get criticalAnnouncement() {
        //return this.$store.getters['server/announcements/getFirstCritical']

        return null
    }
}
</script>

<style scoped></style>
