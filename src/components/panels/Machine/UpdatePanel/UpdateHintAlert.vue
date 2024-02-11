<template>
    <v-alert text dense border="left" color="orange" :icon="mdiAlertCircle">
        <template v-if="boolTitle">
            <strong>{{ $t('Machine.UpdatePanel.UpdateWarning', { name: formatName }) }}</strong>
            <br />
        </template>
        <p v-if="description1">{{ description1 }}</p>
        <p v-if="description2">{{ description2 }}</p>
        <div class="text-center">
            <v-btn
                v-if="configured_type === 'git_repo' && repo.commits_behind?.length"
                class="mx-2 mt-3 mt-sm-0"
                @click="openCommitHistory">
                <v-icon left small>{{ mdiEye }}</v-icon>
                {{ $t('Machine.UpdatePanel.CommitHistory') }}
            </v-btn>
            <v-btn v-if="externalLink" class="mx-2 mt-3 mt-sm-0" :href="externalLink" target="_blank">
                <v-icon left small>{{ mdiOpenInNew }}</v-icon>
                {{ externalLinkText }}
            </v-btn>
        </div>
    </v-alert>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerUpdateManagerStateGitRepo } from '@/store/server/updateManager/types'
import { mdiCloseThick, mdiAlertCircle, mdiEye, mdiOpenInNew } from '@mdi/js'
import Panel from '@/components/ui/Panel.vue'
import GitCommitsListDay from '@/components/panels/Machine/UpdatePanel/GitCommitsListDay.vue'
import { capitalize } from '@/plugins/helpers'

@Component({
    components: { GitCommitsListDay, Panel },
})
export default class UpdateHintAlert extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiAlertCircle = mdiAlertCircle
    mdiEye = mdiEye
    mdiOpenInNew = mdiOpenInNew

    @Prop({ required: true }) readonly repo!: ServerUpdateManagerStateGitRepo
    @Prop({ required: false, default: false }) readonly boolTitle!: boolean

    get name() {
        return this.repo?.name ?? 'UNKNOWN'
    }

    get formatName() {
        return capitalize(this.name)
    }

    get configured_type() {
        return this.repo?.configured_type ?? 'UNKNOWN'
    }

    get description1() {
        if (this.name === 'klipper') return this.$t('Machine.UpdatePanel.KlipperUpdateQuestionFirmware')
        if (this.name === 'moonraker') return this.$t('Machine.UpdatePanel.MoonrakerUpdateQuestion')
        if (this.configured_type === 'web') return this.$t('Machine.UpdatePanel.WebClientUpdateQuestion')

        return this.$t('Machine.UpdatePanel.GenericUpdateQuestion')
    }

    get description2() {
        if (this.name === 'klipper') return this.$t('Machine.UpdatePanel.KlipperUpdateQuestionConfig')

        return null
    }

    get repo_name() {
        return this.repo.repo_name ?? this.repo.name ?? ''
    }

    get externalLink() {
        if (this.name === 'klipper') return '//www.klipper3d.org/Config_Changes.html'
        if (this.name === 'moonraker') return '//moonraker.readthedocs.io/en/latest/changelog/'
        if (this.repo?.configured_type === 'web')
            return `//github.com/${this.repo.owner}/${this.repo_name}/releases/tag/${this.repo.remote_version}`

        return `//github.com/${this.repo.owner}/${this.repo_name}`
    }

    get externalLinkText() {
        if (['klipper', 'moonraker'].includes(this.name)) return this.$t('Machine.UpdatePanel.ConfigChanges')

        return this.$t('Machine.UpdatePanel.GitHubPage')
    }

    openCommitHistory() {
        this.$emit('open-commit-history')
    }
}
</script>
