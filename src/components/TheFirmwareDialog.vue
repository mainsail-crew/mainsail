<template>
    <the-update-dialog
        :show="show"
        :complete="!busy"
        :messages="responses"
        :title-running="$t('App.FirmwareDialog.Updating').toString()"
        :title-done="$t('App.FirmwareDialog.UpdatingDone').toString()"
        item-key="id"
        :render-html="false"
        @close="close" />
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import TheUpdateDialog from '@/components/TheUpdateDialog.vue'
import { FirmwareResponseLine } from '@/store/server/firmware/types'
import { firmwareDialogVisible } from '@/store/server/firmware/helpers'

@Component({
    components: { TheUpdateDialog },
})
export default class TheFirmwareDialog extends Mixins(BaseMixin) {
    get busy(): boolean {
        return this.$store.state.server.firmware?.busy ?? false
    }

    get responses(): FirmwareResponseLine[] {
        return this.$store.getters['server/firmware/getResponses'] ?? []
    }

    get show() {
        return firmwareDialogVisible(this.busy, this.responses.length)
    }

    close() {
        this.$store.commit('server/firmware/clearResponses')
    }
}
</script>
