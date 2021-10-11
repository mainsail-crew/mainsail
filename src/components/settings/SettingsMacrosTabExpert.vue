
<template>
    <div>
        <template v-if="boolFormCreate === false">
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.MacrosTab.Macrogroups') }}</h3>
                <template v-if="groups.length">
                    <div v-for="(group, index) in groups" v-bind:key="index">
                        <v-divider class="my-2" v-if="index"></v-divider>
                        <settings-row :title="group.name" sub-title="blabla" :dynamicSlotWidth="true">
                            <v-btn small outlined @click="deleteMacrogroup(group.index)" class="ml-3 minwidth-0 px-2" color="error">
                                <v-icon small>mdi-delete</v-icon>
                            </v-btn>
                        </settings-row>
                    </div>
                </template>
                <template v-else>
                    <v-row>
                        <v-col>
                            <p class="mb-0 text-center font-italic">{{ $t('Settings.MacrosTab.NoGroups') }}</p>
                        </v-col>
                    </v-row>
                </template>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text color="primary" @click="createGroup">{{ $t("Settings.MacrosTab.CreateGroup")}}</v-btn>
            </v-card-actions>
        </template>
        <template v-else-if="boolFormCreate">
            <v-form v-model="boolFormCreateValid" @submit.prevent="storeGroup" >
                <v-card-text>
                    <h3 class="text-h5 mb-3">{{ $t('Settings.MacrosTab.CreateGroup') }}</h3>
                    <settings-row :title="$t('Settings.MacrosTab.Name')">
                        <v-text-field
                            v-model="form.name"
                            hide-details="auto"
                            :rules="[rules.required, rules.groupUnique]"
                            dense
                            outlined
                        ></v-text-field>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                    <settings-row :title="$t('Settings.MacrosTab.Color')">
                        <v-select v-model="form.color" :items="groupColors" outlined dense hide-details></v-select>
                    </settings-row>
                    <template v-if="form.color === 'custom'">
                        <v-divider class="my-2"></v-divider>
                        <settings-row :title="$t('Settings.MacrosTab.CustomColor')">
                            <v-menu bottom left offset-y :close-on-content-click="false">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn v-bind="attrs" v-on="on" :color="form.colorCustom" class="minwidth-0 px-5" small></v-btn>
                                </template>
                                <v-color-picker
                                    :value="form.colorCustom"
                                    hide-mode-switch
                                    mode="rgba"
                                    @update:color="updateFormCustomColor"
                                ></v-color-picker>
                            </v-menu>
                        </settings-row>
                    </template>
                    <v-divider class="my-2"></v-divider>
                    <settings-row :title="$t('Settings.MacrosTab.ShowInStandby')" :dynamicSlotWidth="true">
                        <v-switch :input-value="form.showInStandby" hide-details class="mt-0"></v-switch>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                    <settings-row :title="$t('Settings.MacrosTab.ShowInPause')" :dynamicSlotWidth="true">
                        <v-switch :input-value="form.showInPause" hide-details class="mt-0"></v-switch>
                    </settings-row>
                    <v-divider class="my-2"></v-divider>
                    <settings-row :title="$t('Settings.MacrosTab.ShowInPrinting')" :dynamicSlotWidth="true">
                        <v-switch :input-value="form.showInPrinting" hide-details class="mt-0"></v-switch>
                    </settings-row>
                </v-card-text>
                <v-card-actions class="d-flex justify-end">
                    <v-btn text @click="boolFormCreate = false">{{ $t('Settings.Cancel')}}</v-btn>
                    <v-btn text color="primary" type="submit">{{ $t('Settings.MacrosTab.StoreGroup') }}</v-btn>
                </v-card-actions>
            </v-form>
        </template>
    </div>
</template>

<script lang="ts">

import {Component, Mixins, Watch} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import {GuiStateMacrogroup} from '@/store/gui/types'
import {Debounce} from 'vue-debounce-decorator'

@Component({
    components: {SettingsRow}
})
export default class SettingsMacrosTabExpert extends Mixins(BaseMixin) {

    private rules = {
        required: (value: string) => value !== '' || 'required',
        groupUnique: (value: string) => !this.existsGroupName(value) || 'Name already exists',
    }

    private boolFormCreate = false
    private boolFormCreateValid = false

    private form: GuiStateMacrogroup = {
        index: null,
        name: '',
        color: 'primary',
        colorCustom: '#000',
        showInStandby: true,
        showInPrinting: true,
        showInPause: true,
    }

    get groupColors() {
        return [
            {
                text: this.$t('Settings.MacrosTab.Primary'),
                value: 'primary',
            },
            {
                text: this.$t('Settings.MacrosTab.Info'),
                value: 'info',
            },
            {
                text: this.$t('Settings.MacrosTab.Warning'),
                value: 'warning',
            },
            {
                text: this.$t('Settings.MacrosTab.Danger'),
                value: 'danger',
            },
            {
                text: this.$t('Settings.MacrosTab.Custom'),
                value: 'custom',
            },
        ]
    }

    get groups() {
        return this.$store.getters['gui/getAllMacroGroups'] ?? []
    }

    existsGroupName(name: string) {
        return (this.groups.findIndex((group: GuiStateMacrogroup) => group.name === name && group.index != this.form.index) >= 0)
    }

    clearColorObject(color: any): string {
        if (typeof color === 'object' && 'hex' in color)
            color = color.hex
        if (color.length > 7)
            color = color.substr(0, 7)
        return color
    }

    updateShowGeneral(newVal: boolean) {
        this.$emit('update:showGeneral', newVal )
    }

    @Debounce(500)
    updateFormCustomColor(newVal: any) {
        this.form.colorCustom = this.clearColorObject(newVal)
    }

    clearForm() {
        this.form.index = null
        this.form.name = ''
        this.form.color = 'primary'
        this.form.colorCustom = '#000'
        this.form.showInStandby = true
        this.form.showInPrinting = true
        this.form.showInPause = true
    }

    createGroup() {
        this.boolFormCreate = true
    }

    storeGroup() {
        if (this.boolFormCreateValid) {
            if (this.form.index !== null) {
                window.console.log('update group')
                //this.$store.dispatch('gui/updatePreset',  this.form )
            } else this.$store.dispatch('gui/storeMarcogroup',  this.form )

            this.clearForm()
            this.boolFormCreate = false
        }
    }

    deleteMacrogroup(id: number) {
        this.$store.dispatch('gui/destroyMacrogroup',  id)
    }

    @Watch('boolFormCreate')
    updatedBoolFormCreate(newVal: boolean) {
        this.updateShowGeneral(!newVal)
    }
}
</script>