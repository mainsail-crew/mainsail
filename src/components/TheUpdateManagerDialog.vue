<template>
    <the-update-dialog
        :show="application !== ''"
        :complete="complete"
        :messages="messages"
        :title-running="titleRunning"
        :title-done="titleDone"
        @close="close" />
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import TheUpdateDialog from '@/components/TheUpdateDialog.vue'
import { ServerUpdateManagerStateMessages } from '@/store/server/updateManager/types'

@Component({
    components: { TheUpdateDialog },
})
export default class TheUpdateManagerDialog extends Mixins(BaseMixin) {
    get application(): string {
        return this.$store.state.server.updateManager.updateResponse.application ?? ''
    }

    get messages(): ServerUpdateManagerStateMessages[] {
        return this.$store.state.server.updateManager.updateResponse.messages ?? []
    }

    get complete(): boolean {
        return this.$store.state.server.updateManager.updateResponse.complete ?? true
    }

    get isRecovery() {
        return this.application.substr(0, 8) === 'recover_'
    }

    get software() {
        return this.isRecovery ? this.application.substr(8) : this.application
    }

    get titleRunning() {
        const key = this.isRecovery ? 'App.UpdateDialog.Recovering' : 'App.UpdateDialog.Updating'

        return this.$t(key, { software: this.software }).toString()
    }

    get titleDone() {
        const key = this.isRecovery ? 'App.UpdateDialog.RecoveringDone' : 'App.UpdateDialog.UpdatingDone'

        return this.$t(key, { software: this.software }).toString()
    }

    close() {
        if (
            this.application !== null &&
            this.complete &&
            ['client', 'mainsail', 'full'].includes(this.application.toLowerCase())
        ) {
            window.location.reload()
            return
        }

        this.$store.commit('server/updateManager/resetUpdateResponse')
        this.$socket.emit(
            'machine.update.status',
            { refresh: false },
            { action: 'server/updateManager/onUpdateStatus' }
        )
    }
}
</script>
