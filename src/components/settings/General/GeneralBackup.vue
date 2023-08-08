<template>
    <div>
        <v-btn :loading="loadings.includes('backupDbButton')" small @click="openDialog">
            {{ $t('Settings.GeneralTab.Backup') }}
        </v-btn>
        <v-dialog v-model="showDialog" persistent :width="360">
            <panel
                :title="$t('Settings.GeneralTab.Backup')"
                card-class="mainsail-backup-dialog"
                :margin-bottom="false"
                :icon="mdiHelpCircle">
                <template #buttons>
                    <v-btn icon tile @click="closeDialog">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>
                    <v-row>
                        <v-col>
                            <p class="mb-0">{{ $t('Settings.GeneralTab.BackupDialog') }}</p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <checkbox-list
                            :options="backupableNamespaces"
                            select-all
                            @update:selectedCheckboxes="onSelectBackupCheckboxes" />
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn color="red" :loading="loadings.includes('backupMainsail')" @click="backupMainsail">
                                {{ $t('Settings.GeneralTab.Backup') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiHelpCircle } from '@mdi/js'
import CheckboxList from '@/components/inputs/CheckboxList.vue'
import { TranslateResult } from 'vue-i18n'
import SettingsGeneralDatabase from '@/components/mixins/settingsGeneralDatabase'

@Component({
    components: { Panel, SettingsRow, CheckboxList },
})
export default class SettingsGeneralTabBackupDatabase extends Mixins(BaseMixin, SettingsGeneralDatabase) {
    mdiHelpCircle = mdiHelpCircle
    mdiCloseThick = mdiCloseThick

    showDialog = false
    backupableNamespaces: { value: string; label: string | TranslateResult }[] = []
    backupCheckboxes: string[] = []

    mounted() {
        this.loadBackupableNamespaces()
    }

    async loadBackupableNamespaces() {
        // reset namespaces
        this.backupableNamespaces = []

        // load DB namespaces from moonraker
        const urlRequestDbList = this.$store.getters['socket/getUrl'] + '/server/database/list'
        const availableNamespaces = await fetch(urlRequestDbList)
            // read json
            .then((response) => response?.json())
            // extract result namespaces
            .then((response) => response?.result?.namespaces ?? [])
            .catch(() => {
                window.console.error('Cannot load Moonraker DB namespaces')
                return []
            })

        // load mainsail keys, if mainsail namespace exists
        if (availableNamespaces.includes('mainsail')) {
            const urlRequestMainsailNamespace =
                this.$store.getters['socket/getUrl'] + '/server/database/item?namespace=mainsail'
            this.backupableNamespaces = await fetch(urlRequestMainsailNamespace)
                // read json
                .then((response) => response?.json())
                // extract result object
                .then((response) => response?.result?.value ?? {})
                // extract keys from mainsail gui object
                .then((objects) => Object.keys(objects))
                // filter initVersion
                .then((keys) => keys.filter((key) => key !== 'initVersion'))
                // convert to locale
                .then((keys) =>
                    keys.map((key) => {
                        const namespace = this.availableKeys.find((namespace) => namespace.value === key)
                        if (namespace) return namespace

                        // fallback return key name
                        return { value: key, label: key }
                    })
                )

            this.backupableNamespaces = this.backupableNamespaces.sort((a, b) => {
                if (a.value === 'general') return -1
                if (b.value === 'general') return 1

                const stringA = a.label.toString().toLowerCase()
                const stringB = b.label.toString().toLowerCase()

                if (stringA < stringB) return -1
                if (stringA > stringB) return 1

                return 0
            })
        }

        // add timelapse if exists
        if (availableNamespaces.includes('timelapse')) {
            this.backupableNamespaces.push({
                value: 'timelapse',
                label: this.$t('Settings.GeneralTab.DbTimelapseSettings'),
            })
        }

        // add webcams if exists
        if (availableNamespaces.includes('webcams')) {
            this.backupableNamespaces.push({
                value: 'webcams',
                label: this.$t('Settings.GeneralTab.DbWebcams'),
            })
        }
    }

    onSelectBackupCheckboxes(backupCheckboxes: string[]) {
        this.backupCheckboxes = backupCheckboxes
    }

    async backupMainsail() {
        await this.$store.dispatch('socket/addLoading', 'backupMainsail')
        await this.$store.dispatch('gui/backupMoonrakerDB', this.backupCheckboxes)
        await this.$store.dispatch('socket/removeLoading', 'backupMainsail')
        this.closeDialog()
    }

    openDialog() {
        this.loadBackupableNamespaces()
        this.showDialog = true
    }

    closeDialog() {
        this.showDialog = false
    }
}
</script>
