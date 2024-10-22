<template>
    <v-list-item class="minHeight30 pr-2">
        <v-list-item-title>
            <v-tooltip left>
                <template #activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">{{ name }}</span>
                </template>
                <span>{{ state }} ({{ subState }})</span>
            </v-tooltip>
        </v-list-item-title>
        <v-list-item-action class="my-0 d-flex flex-row" style="min-width: auto">
            <v-btn v-if="state === 'inactive'" icon small @click="clickStart">
                <v-icon small>{{ mdiPlay }}</v-icon>
            </v-btn>
            <v-btn v-else icon small @click="clickRestart">
                <v-icon small>{{ mdiRestart }}</v-icon>
            </v-btn>
            <v-btn icon small :disabled="disableStopButton" :style="styleStopButton" @click="clickStop">
                <v-icon small>{{ mdiStop }}</v-icon>
            </v-btn>
        </v-list-item-action>
        <confirmation-dialog
            :show="showRestartDialog"
            :title="dialogRestartTitle"
            :text="dialogRestartDescription"
            :action-button-text="$t('App.TopCornerMenu.Restart')"
            :cancel-button-text="$t('App.TopCornerMenu.Cancel')"
            @action="serviceRestart"
            @close="showRestartDialog = false" />
        <confirmation-dialog
            :show="showStopDialog"
            :title="dialogStopTitle"
            :text="dialogStopDescription"
            :action-button-text="$t('App.TopCornerMenu.Stop')"
            :cancel-button-text="$t('App.TopCornerMenu.Cancel')"
            @action="serviceStop"
            @close="showStopDialog = false" />
    </v-list-item>
</template>
<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiPlay, mdiRestart, mdiStop } from '@mdi/js'
import { capitalize } from '@/plugins/helpers'
import ServiceMixins from '@/components/mixins/services'

@Component({})
export default class TopCornerMenuService extends Mixins(BaseMixin, ServiceMixins) {
    mdiPlay = mdiPlay
    mdiRestart = mdiRestart
    mdiStop = mdiStop

    @Prop({ type: String, required: true }) service!: string

    showRestartDialog = false
    showStopDialog = false

    get name() {
        if (this.hideOtherInstances && this.service === this.klipperInstance) return 'Klipper'
        if (this.hideOtherInstances && this.service === this.moonrakerInstance) return 'Moonraker'

        return capitalize(this.service)
    }

    get service_states() {
        return this.$store.state.server.system_info?.service_state ?? {}
    }

    get state() {
        if (this.service in this.service_states) return this.service_states[this.service].active_state

        return null
    }

    get subState() {
        if (this.service in this.service_states) return this.service_states[this.service].sub_state

        return null
    }

    get dialogRestartTitle() {
        if (this.service === this.klipperInstance)
            return this.$t('App.TopCornerMenu.ConfirmationDialog.Title.KlipperRestart')

        return this.$t('App.TopCornerMenu.ConfirmationDialog.Title.ServiceRestart')
    }

    get dialogStopTitle() {
        return this.$t('App.TopCornerMenu.ConfirmationDialog.Title.ServiceStop')
    }

    get dialogRestartDescription() {
        if (this.service === this.klipperInstance)
            return this.$t('App.TopCornerMenu.ConfirmationDialog.Description.KlipperRestart')

        return this.$t('App.TopCornerMenu.ConfirmationDialog.Description.ServiceRestart')
    }

    get dialogStopDescription() {
        if (this.service === this.klipperInstance)
            return this.$t('App.TopCornerMenu.ConfirmationDialog.Description.KlipperStop')

        return this.$t('App.TopCornerMenu.ConfirmationDialog.Description.ServiceStop')
    }

    get disableStopButton() {
        return this.state === 'inactive' || this.service === this.moonrakerInstance
    }

    get styleStopButton() {
        return this.service === this.moonrakerInstance ? 'visibility: hidden;' : ''
    }

    clickStart() {
        this.$socket.emit('machine.services.start', { service: this.service })
        this.closeMenu()
    }

    clickRestart() {
        if (this.printerIsPrinting) {
            this.showRestartDialog = true
            return
        }

        this.serviceRestart()
    }

    clickStop() {
        if (this.printerIsPrinting) {
            this.showStopDialog = true
            return
        }

        this.serviceStop()
    }

    serviceRestart() {
        this.showRestartDialog = false
        this.$socket.emit('machine.services.restart', { service: this.service })
        this.closeMenu()
    }

    serviceStop() {
        this.showStopDialog = false
        this.$socket.emit('machine.services.stop', { service: this.service })
        this.closeMenu()
    }

    closeMenu() {
        this.$emit('close-menu')
    }
}
</script>
