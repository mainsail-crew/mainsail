<template>
    <v-snackbar :value="showSnackbar" :multi-line="true" right top :timeout="-1">
        <div>
            {{ $t('App.Announcements.Announcement') }}
            <br />
            <strong>{{ entry.title }}</strong>
            <br />
            <small>{{ entry.description }}</small>
        </div>

        <template #action="{ attrs }">
            <v-btn color="red" text v-bind="attrs" style="min-width: auto" tile @click="showSnackbar = false">
                <v-icon class="0">{{ mdiClose }}</v-icon>
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import { Mixins, Prop } from 'vue-property-decorator'
import { ServerAnnouncementsStateEntry } from '@/store/server/announcements/types'
import Component from 'vue-class-component'
import { mdiClose } from '@mdi/js'

@Component
export default class AnnouncementSnackbar extends Mixins(BaseMixin) {
    mdiClose = mdiClose

    @Prop({ required: true })
    declare readonly entry: ServerAnnouncementsStateEntry

    private showSnackbar = true

    created() {
        window.console.log('entry', this.entry)
    }
}
</script>

<style scoped></style>
