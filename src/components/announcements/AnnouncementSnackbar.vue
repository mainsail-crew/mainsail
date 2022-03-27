<template>
    <v-alert color="orange" class="announcement-snackbar__alert" :max-width="400">
        <v-row align="start">
            <v-col class="grow">
                <a
                    class="announcement-snackbar__headline d-block white--text text-subtitle-1 text-decoration-none mb-1"
                    :href="entry.url"
                    target="_blank">
                    {{ entry.title }}
                </a>
                <p class="text-body-2 mb-0 white--text" v-html="formatedText"></p>
            </v-col>
            <v-col class="shrink pl-0 pt-2 pr-2">
                <v-btn icon color="white">
                    <v-icon>{{ mdiClose }}</v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-divider color="white" class="mt-3 mb-1"></v-divider>
        <v-row>
            <v-col>
                <v-menu offset-y>
                    <template #activator="{ on, attrs }">
                        <v-btn text v-bind="attrs" v-on="on">{{ $t('App.Announcements.Later') }}</v-btn>
                    </template>
                    <v-list>
                        <v-list-item link>
                            <v-list-item-title @click="dismiss(60 * 60)">
                                {{ $t('App.Announcements.OneHour') }}
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item link>
                            <v-list-item-title @click="dismiss(60 * 60 * 24)">
                                {{ $t('App.Announcements.Tomorrow') }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-col>
            <v-col class="text-right">
                <v-btn text target="_blank" :href="entry.url">{{ $t('App.Announcements.More') }}</v-btn>
            </v-col>
        </v-row>
    </v-alert>
    <!--    <v-snackbar
        class="announcement__snackbar"
        :value="showSnackbar"
        :multi-line="true"
        right
        top
        :timeout="-1"
        :max-width="300"
        vertical>
        <v-btn color="error" icon class="announcement__close-button" @click="close">
            <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
        <v-row>
            <v-col class="pt-2 pb-0">
                <div v-if="entry.priority === 'high'" class="text-overline">
                    {{ $t('App.Announcements.AnnouncementCritical') }}
                </div>
                <div v-else class="text-overline">{{ $t('App.Announcements.Announcement') }}</div>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="pt-0">
                <h1 class="text-subtitle-2">{{ entry.title }}</h1>
                <div class="text-caption mb-2">{{ entry.date.toLocaleString() }}</div>
                <p class="text-body-2 mb-0" v-html="formatedText"></p>
            </v-col>
        </v-row>
        <template #action>
            <v-menu offset-y>
                <template #activator="{ on, attrs }">
                    <v-btn text v-bind="attrs" v-on="on">{{ $t('App.Announcements.Later') }}</v-btn>
                </template>
                <v-list>
                    <v-list-item link>
                        <v-list-item-title @click="dismiss(60 * 60)">
                            {{ $t('App.Announcements.OneHour') }}
                        </v-list-item-title>
                    </v-list-item>
                    <v-list-item link>
                        <v-list-item-title @click="dismiss(60 * 60 * 24)">
                            {{ $t('App.Announcements.Tomorrow') }}
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-btn text color="primary" target="_blank" :href="entry.url">{{ $t('App.Announcements.More') }}</v-btn>
        </template>
    </v-snackbar>-->
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

    get formatedText() {
        return this.entry.description.replace(/\[([^\]]+)\]\(([^\)]+)\)/, '<a href="$2" target="_blank">$1</a>')
    }

    close() {
        this.$socket.emit('server.announcements.dismiss', { entry_id: this.entry.entry_id })
    }

    dismiss(time: number) {
        this.$socket.emit('server.announcements.dismiss', { entry_id: this.entry.entry_id, wake_time: time })
    }
}
</script>

<style scoped>
.announcement-snackbar__alert {
    position: fixed;
    top: 60px;
    right: 20px;
}

.announcement__close-button {
    position: absolute;
    top: 5px;
    right: 5px;
}
</style>
