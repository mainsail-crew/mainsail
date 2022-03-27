<template>
    <v-alert text :color="alertColor">
        <v-row align="start">
            <v-col class="grow">
                <div class="announcement-menu-entry__headline mb-1 text-subtitle-1">
                    <a :class="`text-decoration-none ${alertColor}--text`" :href="entry.url" target="_blank">
                        {{ entry.title }}
                    </a>
                </div>
                <p class="text-body-2 mb-0 text--disabled" v-html="formatedText"></p>
            </v-col>
            <v-col class="shrink pl-0 pt-2 pr-2 d-flex flex-column align-self-stretch justify-space-between">
                <v-btn icon :color="alertColor" @click="close">
                    <v-icon>{{ mdiClose }}</v-icon>
                </v-btn>
                <v-menu offset-y :close-on-content-click="false">
                    <template #activator="{ attr, on }">
                        <v-btn icon plain :color="alertColor" v-bind="attr" v-on="on">
                            <v-icon>{{ mdiAlarmSnooze }}</v-icon>
                        </v-btn>
                    </template>
                    <v-card flat>
                        <v-card-text class="d-flex flex-row flex-nowrap">
                            <v-btn small class="mr-3" @click="dismiss(60 * 60)">1 hour</v-btn>
                            <v-btn small class="mr-3" @click="dismiss(60 * 60 * 24)">1 day</v-btn>
                            <v-btn small @click="dismiss(60 * 60 * 24 * 7)">1 week</v-btn>
                        </v-card-text>
                    </v-card>
                </v-menu>
            </v-col>
        </v-row>
    </v-alert>
</template>

<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { ServerAnnouncementsStateEntry } from '@/store/server/announcements/types'
import { mdiClose, mdiAlarmSnooze } from '@mdi/js'

@Component({
    components: {},
})
export default class AnnouncementMenuEntry extends Mixins(BaseMixin) {
    mdiClose = mdiClose
    mdiAlarmSnooze = mdiAlarmSnooze

    @Prop({ required: true })
    declare readonly entry: ServerAnnouncementsStateEntry

    get formatedText() {
        return this.entry.description.replace(/\[([^\]]+)\]\(([^\)]+)\)/, '<a href="$2" target="_blank">$1</a>')
    }

    get alertColor() {
        if (this.entry.priority === 'high') return 'warning'

        return 'info'
    }

    close() {
        this.$store.dispatch('server/announcements/close', { entry_id: this.entry.entry_id })
    }

    dismiss(time: number) {
        this.$store.dispatch('server/announcements/dismiss', { entry_id: this.entry.entry_id, time })
    }
}
</script>

<style scoped>
.announcement-menu-entry__headline {
    line-height: 1.2;
}
</style>
