
<template>
    <div>
        <template v-if="boolFormCreate === false && boolFormEdit === false">
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.MacrosTab.Macrogroups') }}</h3>
                <template v-if="groups.length">
                    <div v-for="(group, index) in groups" v-bind:key="index">
                        <v-divider class="my-2" v-if="index"></v-divider>
                        <settings-row :title="group.name" :sub-title="$tc('Settings.MacrosTab.CountMacros', group.macros.length, { count: group.macros.length })" :dynamicSlotWidth="true">
                            <v-btn small outlined class="ml-3" @click="editMacrogroup(group)">
                                <v-icon left small>mdi-pencil</v-icon>{{ $t('Settings.Edit') }}
                            </v-btn>
                            <v-btn small outlined @click="deleteMacrogroup(group.id)" class="ml-3 minwidth-0 px-2" color="error">
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
        <template v-else-if="boolFormEdit">
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.MacrosTab.EditGroup') }}</h3>
                <settings-row :title="$t('Settings.MacrosTab.Name')">
                    <v-text-field
                        v-model="editGroup.name"
                        hide-details="auto"
                        :rules="[rules.required, rules.groupUnique]"
                        dense
                        outlined
                        @change="updateGroupOptionName"
                    ></v-text-field>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.MacrosTab.Color')">
                    <v-select v-model="editGroup.color" :items="groupColors" @change="updateGroupOptionColor" outlined dense hide-details></v-select>
                </settings-row>
                <template v-if="editGroup.color === 'custom'">
                    <v-divider class="my-2"></v-divider>
                    <settings-row :title="$t('Settings.MacrosTab.CustomColor')">
                        <v-menu bottom left offset-y :close-on-content-click="false">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn v-bind="attrs" v-on="on" :color="editGroup.colorCustom" class="minwidth-0 px-5" small></v-btn>
                            </template>
                            <v-color-picker
                                :value="editGroup.colorCustom"
                                hide-mode-switch
                                mode="rgba"
                                @update:color="updateGroupOptionColorCustom"
                            ></v-color-picker>
                        </v-menu>
                    </settings-row>
                </template>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.MacrosTab.ShowInStandby')" :dynamicSlotWidth="true">
                    <v-switch :input-value="editGroup.showInStandby" @change="updateGroupOptionShowInStandby" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.MacrosTab.ShowInPause')" :dynamicSlotWidth="true">
                    <v-switch :input-value="editGroup.showInPause" @change="updateGroupOptionShowInPause" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.MacrosTab.ShowInPrinting')" :dynamicSlotWidth="true">
                    <v-switch :input-value="editGroup.showInPrinting" @change="updateGroupOptionShowInPrinting" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <h3 class="text-h5 mt-6 mb-3">{{ $t('Settings.MacrosTab.GroupMacros') }}</h3>
                <template v-if="editGroup.macros && editGroup.macros.length">
                    <draggable v-model="editGroupMacros" handle=".handle" ghost-class="ghost" group="macros" @change="updateMacroOrder">
                        <template v-for="(macro, index) in editGroupMacros">
                            <div v-bind:key="macro.name">
                                <v-row>
                                    <v-col class="col-auto pr-0 d-flex">
                                        <v-icon class="handle">mdi-arrow-up-down</v-icon>
                                    </v-col>
                                    <v-col>
                                        <settings-row :title="macro.name" :sub-title="getMacroDescription(macro.name)" v-bind:key="'groupMacro_macro_'+index" :dynamicSlotWidth="true">
                                            <v-btn small outlined @click="changeColorMacroFromGroup(macro)" class="ml-3 minwidth-0 px-2" :color="macro.color ">
                                                <v-icon small left>mdi-palette</v-icon> {{ macro.color }}
                                            </v-btn>
                                            <v-btn small outlined @click="updateMacroFromGroup(macro, 'showInStandby', !macro.showInStandby)" class="ml-3 minwidth-0 px-2" :color="macro.showInStandby ? '' : 'secondary'">
                                                <v-icon small>mdi-sleep</v-icon>
                                            </v-btn>
                                            <v-btn small outlined @click="updateMacroFromGroup(macro, 'showInPause', !macro.showInPause)" class="ml-3 minwidth-0 px-2" :color="macro.showInPause ? '' : 'secondary'">
                                                <v-icon small>mdi-pause</v-icon>
                                            </v-btn>
                                            <v-btn small outlined @click="updateMacroFromGroup(macro, 'showInPrinting', !macro.showInPrinting)" class="ml-3 minwidth-0 px-2" :color="macro.showInPrinting ? '' : 'secondary'">
                                                <v-icon small>mdi-printer-3d-nozzle</v-icon>
                                            </v-btn>
                                            <v-btn small outlined @click="removeMacroFromGroup(macro)" class="ml-3 minwidth-0 px-2" color="error">
                                                <v-icon small>mdi-delete</v-icon>
                                            </v-btn>
                                        </settings-row>
                                    </v-col>
                                </v-row>
                                <v-divider class="my-2" ></v-divider>
                            </div>
                        </template>
                    </draggable>
                </template>
                <template v-else>
                    <v-row>
                        <v-col>
                            <p class="mb-0 text-center font-italic">{{ $t('Settings.MacrosTab.NoMacrosInGroup') }}</p>
                        </v-col>
                    </v-row>
                </template>
                <h3 class="text-h5 mt-6 mb-3">{{ $t('Settings.MacrosTab.AvailableMacros') }}</h3>
                <template v-if="availableMacros.length">
                    <template v-for="(macro, index) in availableMacros">
                        <v-divider class="my-2" v-if="index" v-bind:key="'availableMacro_deliver_'+index"></v-divider>
                        <settings-row :title="macro.name" :sub-title="macro.description" v-bind:key="'availableMacro_macro_'+index" :dynamicSlotWidth="true">
                            <v-btn small outlined class="ml-3" @click="addMacroToGroup(macro)">
                                <v-icon left small>mdi-plus</v-icon> {{ $t('Settings.MacrosTab.Add') }}
                            </v-btn>
                        </settings-row>
                    </template>
                </template>
                <template v-else>
                    <v-row>
                        <v-col>
                            <p class="mb-0 text-center font-italic">{{ $t('Settings.MacrosTab.NoAvailableMacros') }}</p>
                        </v-col>
                    </v-row>
                </template>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text @click="boolFormEdit = false">{{ $t('Settings.Cancel')}}</v-btn>
            </v-card-actions>
        </template>
    </div>
</template>

<script lang="ts">

import {Component, Mixins, Watch} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import draggable from 'vuedraggable'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import {GuiStateMacrogroup, GuiStateMacrogroupMacros} from '@/store/gui/types'
import {Debounce} from 'vue-debounce-decorator'
import {PrinterStateMacro} from '@/store/printer/types'

@Component({
    components: {SettingsRow, draggable}
})
export default class SettingsMacrosTabExpert extends Mixins(BaseMixin) {
    private rules = {
        required: (value: string) => value !== '' || 'required',
        groupUnique: (value: string) => !this.existsGroupName(value) || 'Name already exists',
    }

    private boolFormCreate = false
    private boolFormCreateValid = false

    private form: GuiStateMacrogroup = {
        id: null,
        name: '',
        color: 'primary',
        colorCustom: '#000',
        showInStandby: true,
        showInPrinting: true,
        showInPause: true,
    }

    private boolFormEdit = false
    private editGroupId: string | null = ''

    get groupColors() {
        return [
            {
                text: this.$t('Settings.MacrosTab.Primary'),
                value: 'primary',
            },
            {
                text: this.$t('Settings.MacrosTab.Secondary'),
                value: 'secondary',
            },
            {
                text: this.$t('Settings.MacrosTab.Success'),
                value: 'success',
            },
            {
                text: this.$t('Settings.MacrosTab.Warning'),
                value: 'warning',
            },
            {
                text: this.$t('Settings.MacrosTab.Error'),
                value: 'error',
            },
            {
                text: this.$t('Settings.MacrosTab.Custom'),
                value: 'custom',
            },
        ]
    }

    get macroColors() {
        const colors = [...this.groupColors]
        const indexCustom = colors.findIndex((color) => color.value === 'custom')
        if (indexCustom !== -1) colors.splice(indexCustom, 1)

        colors.push({
            text: this.$t('Settings.MacrosTab.Group'),
            value: 'group'
        })

        return colors
    }

    get allMacros() {
        return this.$store.getters['printer/getAllMacros'] ?? []
    }

    get availableMacros() {
        return this.allMacros.filter((m: GuiStateMacrogroupMacros) => !this.editGroupUsedMacros.includes(m.name))
    }

    get groups() {
        return this.$store.getters['gui/getAllMacroGroups'] ?? []
    }

    get editGroupUsedMacros() {
        return this.editGroup?.macros?.map((m: GuiStateMacrogroupMacros) => m.name) ?? []
    }

    get editGroup(): GuiStateMacrogroup | null {
        return this.$store.getters['gui/getMacroGroup'](this.editGroupId)
    }

    get editGroupMacros() {
        const macros = this.editGroup?.macros ?? []
        macros.sort((a, b) => a.pos - b.pos)

        return macros
    }

    set editGroupMacros(newVal) {

    }

    existsGroupName(name: string) {
        return (this.groups.findIndex((group: GuiStateMacrogroup) => group.name === name && group.id != this.editGroupId) >= 0)
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
        this.form.id = null
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
            if (this.form.id !== null) {
                window.console.log('update group')
                //this.$store.dispatch('gui/updatePreset',  this.form )
            } else this.$store.dispatch('gui/storeMarcogroup',  this.form )

            this.clearForm()
            this.boolFormCreate = false
        }
    }

    editMacrogroup(group: GuiStateMacrogroup) {
        this.boolFormEdit = true
        this.editGroupId = group.id
    }

    deleteMacrogroup(id: string) {
        this.$store.dispatch('gui/destroyMacrogroup',  id)
    }

    addMacroToGroup(macro: PrinterStateMacro) {
        this.$store.dispatch('gui/addMacroToMacrogroup', {
            group: this.editGroupId,
            macro: macro.name
        })
    }

    updateMacroFromGroup(macro: GuiStateMacrogroupMacros, option: string, value: boolean | string | number) {
        this.$store.dispatch('gui/updateMacroFromMacrogroup', {
            group: this.editGroupId,
            macro: macro.name,
            option: option,
            value: value
        })
    }

    updateMacroOrder(output: any) {
        const oldIndex = output.moved.oldIndex ?? 0
        const newIndex = output.moved.newIndex ?? 0
        const oldPos = this.editGroupMacros[oldIndex].pos
        const newPos = this.editGroupMacros[newIndex].pos

        this.updateMacroFromGroup(this.editGroupMacros[oldIndex], 'pos', newPos)
        this.updateMacroFromGroup(this.editGroupMacros[newIndex], 'pos', oldPos)
    }

    changeColorMacroFromGroup(macro: GuiStateMacrogroupMacros) {
        let index = this.macroColors.findIndex((color) => color.value === macro.color) + 1
        const maxIndex = this.macroColors.length - 1

        if (index > maxIndex) index = 0
        const newColor = this.macroColors[index].value

        this.updateMacroFromGroup(macro, 'color', newColor)
    }

    removeMacroFromGroup(macro: GuiStateMacrogroupMacros) {
        this.$store.dispatch('gui/removeMacroFromMacrogroup', {
            group: this.editGroupId,
            macro: macro.name
        })
    }

    getMacroDescription(macroname: string) {
        const macro = this.allMacros.find((m: PrinterStateMacro) => m.name.toLowerCase() === macroname.toLowerCase())
        return macro?.description ?? null
    }

    updateMacrogroupOption(option: string, newVal: boolean | string) {
        this.$store.dispatch('gui/updateMacrogroup', {
            group: this.editGroupId,
            option: option,
            value: newVal
        })
    }

    @Debounce(250)
    updateGroupOptionName(newVal: string) {
        this.updateMacrogroupOption('name', newVal)
    }

    updateGroupOptionColor(newVal: string) {
        this.updateMacrogroupOption('color', newVal)
    }

    @Debounce(250)
    updateGroupOptionColorCustom(newVal: string) {
        this.updateMacrogroupOption('colorCustom', this.clearColorObject(newVal))
    }

    updateGroupOptionShowInStandby(newVal: boolean) {
        this.updateMacrogroupOption('showInStandby', newVal)
    }

    updateGroupOptionShowInPause(newVal: boolean) {
        this.updateMacrogroupOption('showInPause', newVal)
    }

    updateGroupOptionShowInPrinting(newVal: boolean) {
        this.updateMacrogroupOption('showInPrinting', newVal)
    }

    @Watch('boolFormCreate')
    updatedBoolFormCreate(newVal: boolean) {
        this.updateShowGeneral(!newVal)
    }

    @Watch('boolFormEdit')
    updatedBoolFormEdit(newVal: boolean) {
        this.updateShowGeneral(!newVal)
    }
}
</script>