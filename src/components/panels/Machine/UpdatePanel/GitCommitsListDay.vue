<template>
    <div>
        <v-timeline-item small class="git-commit-list-day">
            <v-row class="pt-0">
                <v-col class="pr-12">
                    <h3 class="caption">
                        {{ $t('Machine.UpdatePanel.CommitsOnDate', { date: groupedCommitsDate }) }}
                    </h3>
                    <ul class="commits mt-3 pl-0">
                        <git-commits-list-day-commit
                            v-for="commit of groupedCommits.commits"
                            :key="commit.sha"
                            :commit="commit"
                            :repo="repo" />
                    </ul>
                </v-col>
            </v-row>
        </v-timeline-item>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {
    ServerUpdateManagerStateGitRepo,
    ServerUpdateManagerStateGitRepoGroupedCommits,
} from '@/store/server/updateManager/types'
import Panel from '@/components/ui/Panel.vue'
import GitCommitsListDayCommit from '@/components/panels/Machine/UpdatePanel/GitCommitsListDayCommit.vue'

@Component({
    components: { Panel, GitCommitsListDayCommit },
})
export default class GitCommitsListDay extends Mixins(BaseMixin) {
    @Prop({ required: true }) readonly groupedCommits!: ServerUpdateManagerStateGitRepoGroupedCommits
    @Prop({ required: true }) readonly repo!: ServerUpdateManagerStateGitRepo

    get groupedCommitsDate() {
        return new Date(this.groupedCommits.date).toLocaleDateString(this.browserLocale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }
}
</script>

<style lang="scss" scoped>
.git-commit-list-day ::v-deep .v-timeline-item__dot--small {
    width: 18px;
    height: 15px;
    margin-top: 2px;

    &:before {
        display: block;
        content: ' ';
        position: relative;
        width: 18px;
        height: 2px;
        top: 7px;
        background: rgba(255, 255, 255, 0.5);
        z-index: 1;
    }
}

.git-commit-list-day ::v-deep .v-timeline-item__inner-dot {
    background-color: #1e1e1e !important;
    border: 2px solid rgba(255, 255, 255, 0.5) !important;
    width: 8px;
    height: 8px;
    position: relative;
    z-index: 2;
    margin-left: 5px;
    margin-top: 2px;
}

ul.commits {
    list-style: none;
}
</style>
