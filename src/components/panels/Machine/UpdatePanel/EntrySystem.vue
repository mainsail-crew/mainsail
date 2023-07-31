<template>
    <div>
        <v-row class="py-2">
            <v-col class="pl-6">
                <strong>{{ $t('Machine.UpdatePanel.System') }}</strong>
                <br />
                <template v-if="package_count">
                    <a class="info--text cursor--pointer" @click="boolShowPackageList = true">
                        <v-icon small color="info" class="mr-1">{{ mdiInformation }}</v-icon>
                        {{ $t('Machine.UpdatePanel.CountPackagesCanBeUpgraded', { count: package_count }) }}
                    </a>
                </template>
                <span v-else>{{ $t('Machine.UpdatePanel.OSPackages') }}</span>
            </v-col>
            <v-col class="col-auto pr-6 text-right" align-self="center">
                <v-chip
                    small
                    label
                    outlined
                    :color="btnColor"
                    :disabled="btnDisabled"
                    class="minwidth-0 px-2 text-uppercase"
                    @click="doUpdate">
                    <v-icon small class="mr-1">{{ btnIcon }}</v-icon>
                    {{ btnText }}
                </v-chip>
            </v-col>
        </v-row>
        <system-packages-list
            :bool-show-dialog="boolShowPackageList"
            :packages-list="package_list"
            @close-dialog="closePackagesList" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiCheck, mdiInformation, mdiProgressUpload } from '@mdi/js'
@Component
export default class UpdatePanelEntrySystem extends Mixins(BaseMixin) {
    mdiInformation = mdiInformation

    // to display the dialog for packages
    boolShowPackageList = false

    get package_count() {
        return this.$store.state.server.updateManager?.system?.package_count ?? 0
    }

    get package_list() {
        return this.$store.state.server.updateManager?.system?.package_list ?? []
    }

    get btnDisabled() {
        // disable button if the printer is printing
        if (['printing', 'paused'].includes(this.printer_state)) return true

        // disable button if no package is available to update
        return this.package_count === 0
    }

    get btnIcon() {
        if (this.package_count) return mdiProgressUpload

        return mdiCheck
    }

    get btnColor() {
        // set button to primary, if updates are available
        if (this.package_count) return 'primary'

        return 'green'
    }

    get btnText() {
        if (this.package_count) return this.$t('Machine.UpdatePanel.Upgrade')

        return this.$t('Machine.UpdatePanel.UpToDate')
    }

    doUpdate() {
        this.$socket.emit('machine.update.system', {})
    }

    closePackagesList() {
        this.boolShowPackageList = false
    }
}
</script>

<style scoped></style>
