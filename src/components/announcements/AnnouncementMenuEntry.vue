<template>
    <v-alert text :color="alertColor" border="left">
        <v-row align="start">
            <v-col class="grow">
                <div class="announcement-menu-entry__headline mb-1 text-subtitle-1">
                    <a :class="`text-decoration-none ${alertColor}--text`" :href="entry.url" target="_blank">
                        <v-icon small :class="`${alertColor}--text pb-1`">
                            {{ mdiLinkVariant }}
                        </v-icon>
                        {{ entry.title }}
                    </a>
                </div>
                <p class="text-body-2 mb-0 text--disabled font-weight-light" v-html="formatedText"></p>
            </v-col>
            <v-col class="shrink pl-0 pb-0 pt-1 pr-2 d-flex flex-column align-self-stretch justify-space-between">
                <v-btn icon plain :color="alertColor" class="mb-2" @click="close">
                    <v-icon>{{ mdiClose }}</v-icon>
                </v-btn>
                <v-btn
                    icon
                    plain
                    retain-focus-on-click
                    :color="alertColor"
                    class="pb-1"
                    @click="expand = !expand"
                    @blur="expand = false">
                    <v-icon>{{ mdiBellOffOutline }}</v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-expand-transition>
                <div v-show="expand" class="pt-1" style="width: 100%">
                    <v-divider class="pb-1 ml-2"></v-divider>
                    <div class="text-right py-1" style="font-size: 0.875rem">
                        <span class="text--disabled text-caption font-weight-light">
                            Remind in:
                            <v-btn
                                :color="alertColor"
                                x-small
                                plain
                                text
                                outlined
                                class="mx-1"
                                @click="dismiss(60 * 60)">
                                1H
                            </v-btn>
                            <v-btn
                                :color="alertColor"
                                x-small
                                plain
                                text
                                outlined
                                class="mx-1"
                                @click="dismiss(60 * 60 * 24)">
                                1D
                            </v-btn>
                            <v-btn
                                :color="alertColor"
                                x-small
                                plain
                                text
                                outlined
                                class="mx-1"
                                @click="dismiss(60 * 60 * 24 * 7)">
                                7D
                            </v-btn>
                        </span>
                    </div>
                </div>
            </v-expand-transition>
        </v-row>
    </v-alert>
</template>

<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { ServerAnnouncementsStateEntry } from '@/store/server/announcements/types'
import { mdiClose, mdiLinkVariant, mdiBellOffOutline } from '@mdi/js'

@Component({
    components: {},
})
export default class AnnouncementMenuEntry extends Mixins(BaseMixin) {
    mdiClose = mdiClose
    mdiLinkVariant = mdiLinkVariant
    mdiBellOffOutline = mdiBellOffOutline

    private expand = false

    @Prop({ required: true })
    declare readonly entry: ServerAnnouncementsStateEntry

    get formatedText() {
        return this.entry.description.replace(/\[([^\]]+)\]\(([^)]+)\)/, '<a href="$2" target="_blank">$1</a>')
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
