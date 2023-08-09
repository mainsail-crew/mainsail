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
import { Mixins } from 'vue-property-decorator'
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

    async mounted() {
        this.backupableNamespaces = await this.loadBackupableNamespaces()
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

    async openDialog() {
        this.backupableNamespaces = await this.loadBackupableNamespaces()
        this.showDialog = true
    }

    closeDialog() {
        this.showDialog = false
    }
}
</script>
