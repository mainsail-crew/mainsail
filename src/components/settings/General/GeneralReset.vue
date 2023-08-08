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

    mounted() {
        this.loadResetableNamespaces()
    }

    async loadResetableNamespaces() {
        // reset namespaces
        this.resetableNamespaces = []

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
            this.resetableNamespaces = await fetch(urlRequestMainsailNamespace)
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

            this.resetableNamespaces = this.resetableNamespaces.sort((a, b) => {
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
            this.resetableNamespaces.push({
                value: 'timelapse',
                label: this.$t('Settings.GeneralTab.DbTimelapseSettings'),
            })
        }

        // add webcams if exists
        if (availableNamespaces.includes('webcams')) {
            this.resetableNamespaces.push({
                value: 'webcams',
                label: this.$t('Settings.GeneralTab.DbWebcams'),
            })
        }
    }

    onSelectResetCheckboxes(resetCheckboxes: string[]) {
        this.resetCheckboxes = resetCheckboxes
    }

    resetMainsailAction() {
        this.$store.dispatch('socket/addLoading', 'resetMainsail')
        this.$store.dispatch('gui/resetMoonrakerDB', this.resetCheckboxes)
    }

    openDialog() {
        this.loadResetableNamespaces()
        this.showDialog = true
    }

    closeDialog() {
        this.showDialog = false
    }
}
</script>
