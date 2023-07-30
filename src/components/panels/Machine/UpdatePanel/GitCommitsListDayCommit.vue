<template>
    <li class="commit px-3 py-2">
        <v-row>
            <v-col>
                <h4 class="subtitle-2 text--white mb-0">
                    {{ title }}
                    <v-chip outlined label x-small class="ml-2 px-2" @click="showDetails = !showDetails">
                        <v-icon small>{{ mdiDotsHorizontal }}</v-icon>
                    </v-chip>
                </h4>
                <p
                    v-if="showDetails"
                    class="caption text--secondary mb-2"
                    style="white-space: pre-line"
                    v-html="message"></p>
                <p class="caption mb-0">
                    <span class="font-weight-bold text-decoration-none white--text">
                        {{ author }}
                    </span>
                    <span>{{ commitFormatDate }}</span>
                </p>
            </v-col>
            <v-col class="col-auto pt-4">
                <v-chip outlined label small :href="commitHref" target="_blank">
                    {{ commitShortSha }}
                </v-chip>
            </v-col>
        </v-row>
    </li>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiDotsHorizontal } from '@mdi/js'
import {
    ServerUpdateManagerStateGitRepo,
    ServerUpdateManagerStateGitRepoCommit,
} from '@/store/server/updateManager/types'
import Panel from '@/components/ui/Panel.vue'

@Component({
    components: { Panel },
})
export default class GitCommitsListDayCommit extends Mixins(BaseMixin) {
    mdiDotsHorizontal = mdiDotsHorizontal

    @Prop({ required: true }) readonly commit!: ServerUpdateManagerStateGitRepoCommit
    @Prop({ required: true }) readonly repo!: ServerUpdateManagerStateGitRepo

    showDetails = false

    get title() {
        return this.commit.subject
    }

    get message() {
        return this.commit.message
    }

    get author() {
        return this.commit.author
    }

    get commitFormatDate() {
        const commitDay = new Date(this.commit.date * 1000)
        commitDay.setHours(0, 0, 0, 0)
        const todayDay = new Date()
        todayDay.setHours(0, 0, 0, 0)
        const diff = Math.floor(todayDay.getTime() - commitDay.getTime()) / (1000 * 60 * 60 * 24)

        if (diff === 0) {
            const diffHours = Math.floor((new Date().getTime() - this.commit.date * 1000) / (1000 * 60 * 60))

            return this.$t('Machine.UpdatePanel.CommittedHoursAgo', { hours: diffHours })
        } else if (diff === 1) return this.$t('Machine.UpdatePanel.CommittedYesterday')
        else if (diff < 29) return this.$t('Machine.UpdatePanel.CommittedDaysAgo', { days: diff })
        else
            return this.$t('Machine.UpdatePanel.CommittedOnDate', {
                date: commitDay.toLocaleDateString(this.browserLocale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                }),
            })
    }

    get repo_name() {
        return this.repo.repo_name ?? this.repo.name ?? ''
    }

    get commitHref() {
        return `https://github.com/${this.repo.owner}/${this.repo_name}/commit/${this.commit.sha}`
    }

    get commitShortSha() {
        return this.commit.sha.substring(0, 6)
    }
}
</script>

<style lang="scss" scoped>
li.commit {
    border-color: rgb(48, 54, 61);
    border-style: solid;
    border-width: 1px;
    border-bottom-width: 0;

    &:first-child {
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
    }

    &:last-child {
        border-bottom-width: 1px;
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
    }
}
</style>
