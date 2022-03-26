<template>
    <div></div>
</template>

<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import { Mixins } from 'vue-property-decorator'

export class AnnouncementsWrapper extends Mixins(BaseMixin) {
    get annoncements() {
        const entries = this.$store.state.server?.announcements?.entries ?? []

        window.console.log(entries)

        return entries
    }
}
</script>

<style scoped></style>
