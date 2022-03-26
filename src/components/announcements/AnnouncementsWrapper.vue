<template>
    <div>
        <template v-if="announcements.length">
            <announcement-snackbar v-for="(entry, index) in announcements" :key="index" :entry="entry" />
        </template>
    </div>
</template>

<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import { Component, Mixins } from 'vue-property-decorator'
import AnnouncementSnackbar from '@/components/announcements/AnnouncementSnackbar.vue'

@Component({
    components: { AnnouncementSnackbar },
})
export default class AnnouncementsWrapper extends Mixins(BaseMixin) {
    get announcements() {
        const entries = this.$store.state.server?.announcements?.entries ?? []

        window.console.log(entries)

        return entries
    }
}
</script>

<style scoped></style>
