<template>
    <v-alert text color="info">
        <v-row align="start">
            <v-col class="grow">
                <a
                    class="announcement-menu-entry__headline d-block text-subtitle-1 text-decoration-none mb-1"
                    :href="entry.url"
                    target="_blank">
                    {{ entry.title }}
                </a>
                <p class="text-body-2 mb-0 text--disabled" v-html="formatedText"></p>
            </v-col>
            <v-col class="shrink pl-0 pt-2 pr-2">
                <v-btn icon color="primary">
                    <v-icon>{{ mdiClose }}</v-icon>
                </v-btn>
            </v-col>
        </v-row>
    </v-alert>
</template>

<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { ServerAnnouncementsStateEntry } from '@/store/server/announcements/types'
import { mdiClose } from '@mdi/js'

@Component({
    components: {},
})
export default class AnnouncementMenuEntry extends Mixins(BaseMixin) {
    mdiClose = mdiClose

    @Prop({ required: true })
    declare readonly entry: ServerAnnouncementsStateEntry

    get formatedText() {
        return this.entry.description.replace(/\[([^\]]+)\]\(([^\)]+)\)/, '<a href="$2" target="_blank">$1</a>')
    }
}
</script>

<style scoped>
.announcement-menu-entry__headline {
    line-height: 1.2;
}
</style>
