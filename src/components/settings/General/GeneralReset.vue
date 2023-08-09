<template>
    <div>
        <v-btn color="error" small @click="openDialog">
            {{ $t('Settings.GeneralTab.FactoryReset') }}
        </v-btn>
        <v-dialog v-model="showDialog" persistent :width="360">
            <panel
                :title="$t('Settings.GeneralTab.FactoryReset')"
                card-class="mainsail-reset-dialog"
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
                            <p class="mb-0">{{ $t('Settings.GeneralTab.FactoryDialog') }}</p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <checkbox-list
                            :options="resetableNamespaces"
                            select-all
                            @update:selectedCheckboxes="onSelectResetCheckboxes" />
                    </v-row>
                    <v-row>
                        <v-col class="text-center">
                            <v-btn
                                color="red"
                                :loading="loadings.includes('resetMainsail')"
                                @click="resetMainsailAction">
                                {{ $t('Settings.GeneralTab.Reset') }}
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
export default class SettingsGeneralTabResetDatabase extends Mixins(BaseMixin, SettingsGeneralDatabase) {
    mdiHelpCircle = mdiHelpCircle
    mdiCloseThick = mdiCloseThick

    showDialog = false
    resetableNamespaces: { value: string; label: string | TranslateResult }[] = []
    resetCheckboxes: string[] = []

    async mounted() {
        this.resetableNamespaces = await this.loadBackupableNamespaces()
    }

    onSelectResetCheckboxes(resetCheckboxes: string[]) {
        this.resetCheckboxes = resetCheckboxes
    }

    resetMainsailAction() {
        this.$store.dispatch('socket/addLoading', 'resetMainsail')
        this.$store.dispatch('gui/resetMoonrakerDB', this.resetCheckboxes)
    }

    async openDialog() {
        this.resetableNamespaces = await this.loadBackupableNamespaces()
        this.showDialog = true
    }

    closeDialog() {
        this.showDialog = false
    }
}
</script>
