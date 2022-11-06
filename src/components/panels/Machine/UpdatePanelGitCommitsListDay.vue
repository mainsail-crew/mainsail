<template>
    <div>
        <v-timeline-item v-for="commit of commits" :key="commit.date.getTime()" small>
            <v-row class="pt-0">
                <v-col class="pr-12">
                    <h3 class="caption">
                        {{
                            $t('Machine.UpdatePanel.CommitsOnDate', {
                                date: new Date(group.date).toLocaleDateString(language, dateOptions),
                            })
                        }}
                    </h3>
                    <ul class="commits mt-3 pl-0"></ul>
                </v-col>
            </v-row>
        </v-timeline-item>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import {
    ServerUpdateManagerStateGitRepo,
    ServerUpdateManagerStateGitRepoGroupedCommit,
} from '@/store/server/updateManager/types'
import Panel from '@/components/ui/Panel.vue'

@Component({
    components: { Panel },
})
export default class UpdatePanelGitCommitsListDay extends Mixins(BaseMixin) {
    @Prop({ required: true }) readonly commits!: ServerUpdateManagerStateGitRepoGroupedCommit[]
    @Prop({ required: true }) readonly repo!: ServerUpdateManagerStateGitRepo
}
</script>
