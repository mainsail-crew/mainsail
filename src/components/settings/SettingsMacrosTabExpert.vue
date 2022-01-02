
<template>
    <div>
        <template v-if="boolFormEdit === false">
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.MacrosTab.Macrogroups') }}</h3>
                <template v-if="groups.length">
                    <div v-for="(group, index) in groups" v-bind:key="index">
                        <v-divider class="my-2" v-if="index"></v-divider>
                        <settings-row :title="group.name !== '' ? group.name : '<'+$t('Settings.MacrosTab.UnknownGroup')+'>'" :sub-title="$tc('Settings.MacrosTab.CountMacros', ('macros' in group ? group.macros.length : 0), { count: ('macros' in group ? group.macros.length : 0) })" :dynamicSlotWidth="true">
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
                <v-btn text color="primary" @click="addGroup">{{ $t("Settings.MacrosTab.AddGroup")}}</v-btn>
            </v-card-actions>
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
                    <v-select v-model="editGroup.color" :items="groupColors" @change="updateGroupOptionColor" outlined dense hide-details attach></v-select>
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
                <settings-row :title="$t('Settings.MacrosTab.Status')">
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn small outlined v-bind="attrs" v-on="on" @click="updateGroupOptionShowInStandby(!editGroup.showInStandby)" class="ml-3 minwidth-0 px-2" :color="editGroup.showInStandby ? '' : 'secondary'">
                                <v-icon small>mdi-sleep</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('Settings.MacrosTab.ShowInStateStandby') }}</span>
                    </v-tooltip>
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn small outlined v-bind="attrs" v-on="on" @click="updateGroupOptionShowInPause(!editGroup.showInPause)" class="ml-3 minwidth-0 px-2" :color="editGroup.showInPause ? '' : 'secondary'">
                                <v-icon small>mdi-pause</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('Settings.MacrosTab.ShowInStatePaused') }}</span>
                    </v-tooltip>
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn small outlined v-bind="attrs" v-on="on" @click="updateGroupOptionShowInPrinting(!editGroup.showInPrinting)" class="ml-3 minwidth-0 px-2" :color="editGroup.showInPrinting ? '' : 'secondary'">
                                <v-icon small>mdi-printer-3d-nozzle</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('Settings.MacrosTab.ShowInStatePrinting') }}</span>
                    </v-tooltip>
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
                                            <template v-if="existsMacro(macro.name)">
                                                <v-tooltip top>
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-btn small outlined v-bind="attrs" v-on="on" @click="changeColorMacroFromGroup(macro)" class="ml-3 minwidth-0 px-2" :color="macro.color ">
                                                            <v-icon small left>mdi-palette</v-icon> {{ macro.color }}
                                                        </v-btn>
                                                    </template>
                                                    <span>{{ $t('Settings.MacrosTab.ChangeMacroColor') }}</span>
                                                </v-tooltip>
                                                <v-tooltip top>
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-btn small outlined v-bind="attrs" v-on="on" @click="updateMacroFromGroup(macro, 'showInStandby', !macro.showInStandby)" class="ml-3 minwidth-0 px-2" :color="macro.showInStandby ? '' : 'secondary'">
                                                            <v-icon small>mdi-sleep</v-icon>
                                                        </v-btn>
                                                    </template>
                                                    <span>{{ $t('Settings.MacrosTab.ShowInStateStandby') }}</span>
                                                </v-tooltip>
                                                <v-tooltip top>
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-btn small outlined v-bind="attrs" v-on="on" @click="updateMacroFromGroup(macro, 'showInPause', !macro.showInPause)" class="ml-3 minwidth-0 px-2" :color="macro.showInPause ? '' : 'secondary'">
                                                            <v-icon small>mdi-pause</v-icon>
                                                        </v-btn>
                                                    </template>
                                                    <span>{{ $t('Settings.MacrosTab.ShowInStatePaused') }}</span>
                                                </v-tooltip>
                                                <v-tooltip top>
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-btn small outlined v-bind="attrs" v-on="on" @click="updateMacroFromGroup(macro, 'showInPrinting', !macro.showInPrinting)" class="ml-3 minwidth-0 px-2" :color="macro.showInPrinting ? '' : 'secondary'">
                                                            <v-icon small>mdi-printer-3d-nozzle</v-icon>
                                                        </v-btn>
                                                    </template>
                                                    <span>{{ $t('Settings.MacrosTab.ShowInStatePrinting') }}</span>
                                                </v-tooltip>
                                            </template>
                                            <v-tooltip top>
                                                <template v-slot:activator="{ on, attrs }">
                                                    <v-btn small outlined v-bind="attrs" v-on="on" @click="removeMacroFromGroup(macro)" class="ml-3 minwidth-0 px-2" color="error">
                                                        <v-icon small>mdi-delete</v-icon>
                                                    </v-btn>
                                                </template>
                                                <span>{{ $t('Settings.MacrosTab.DeleteMacroFromGroup') }}</span>
                                            </v-tooltip>
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
                <v-btn text @click="cancelEditMacrogroup">{{ $t('Settings.Close')}}</v-btn>
            </v-card-actions>
        </template>
    </div>
</template>

<script lang="ts">

import {Component, Mixins, Watch} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import draggable from 'vuedraggable'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import {Debounce} from 'vue-debounce-decorator'
import {PrinterStateMacro} from '@/store/printer/types'
import {GuiMacrosStateMacrogroup, GuiMacrosStateMacrogroupMacro} from '@/store/gui/macros/types'

@Component({
    components: {SettingsRow, draggable}
})
export default class SettingsMacrosTabExpert extends Mixins(BaseMixin) {
    private rules = {
        required: (value: string) => value !== '' || 'required',
        groupUnique: (value: string) => !this.existsGroupName(value) || 'Name already exists',
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
        return this.allMacros.filter((m: GuiMacrosStateMacrogroupMacro) => !this.editGroupUsedMacros.includes(m.name))
    }

    get groups() {
        return this.$store.getters['gui/macros/getAllMacrogroups'] ?? []
    }

    get editGroupUsedMacros() {
        return this.editGroup?.macros?.map((m: GuiMacrosStateMacrogroupMacro) => m.name) ?? []
    }

    get editGroup(): GuiMacrosStateMacrogroup | null {
        return this.$store.getters['gui/macros/getMacrogroup'](this.editGroupId)
    }

    get editGroupMacros() {
        const macros = this.editGroup?.macros ?? []
        macros.sort((a: GuiMacrosStateMacrogroupMacro, b: GuiMacrosStateMacrogroupMacro) => a.pos - b.pos)

        return macros
    }

    set editGroupMacros(newVal) {

    }

    existsGroupName(name: string) {
        return (this.groups.findIndex((group: GuiMacrosStateMacrogroup) => group.name === name && group.id != this.editGroupId) >= 0)
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

    async addGroup() {
        const values = {
            name: '',
            color: 'primary',
            colorCustom: '#fff',
            showInStandby: true,
            showInPause: true,
            showInPrinting: true,
        }
        this.editGroupId = await this.$store.dispatch('gui/macros/groupStore',  { values })

        this.boolFormEdit = true
    }

    editMacrogroup(group: GuiMacrosStateMacrogroup) {
        this.boolFormEdit = true
        this.editGroupId = group.id
    }

    deleteMacrogroup(id: string) {
        this.$store.dispatch('gui/macros/groupDelete', id)
    }

    addMacroToGroup(macro: PrinterStateMacro) {
        this.$store.dispatch('gui/macros/addMacroToMacrogroup', {
            id: this.editGroupId,
            macro: macro.name
        })
    }

    updateMacroFromGroup(macro: GuiMacrosStateMacrogroupMacro, option: string, value: boolean | string | number) {
        this.$store.dispatch('gui/macros/updateMacroFromMacrogroup', {
            id: this.editGroupId,
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

    changeColorMacroFromGroup(macro: GuiMacrosStateMacrogroupMacro) {
        let index = this.macroColors.findIndex((color) => color.value === macro.color) + 1
        const maxIndex = this.macroColors.length - 1

        if (index > maxIndex) index = 0
        const newColor = this.macroColors[index].value

        this.updateMacroFromGroup(macro, 'color', newColor)
    }

    removeMacroFromGroup(macro: GuiMacrosStateMacrogroupMacro) {
        this.$store.dispatch('gui/macros/removeMacroFromMacrogroup', {
            id: this.editGroupId,
            macro: macro.name
        })
    }

    existsMacro(macroname: string) {
        return (this.allMacros.findIndex((m: PrinterStateMacro) => m.name.toLowerCase() === macroname.toLowerCase()) !== -1)
    }

    getMacroDescription(macroname: string) {
        const macro = this.allMacros.find((m: PrinterStateMacro) => m.name.toLowerCase() === macroname.toLowerCase())
        if (!macro) return this.$t('Settings.MacrosTab.DeletedMacro')

        return macro?.description ?? null
    }

    updateMacrogroupOption(option: string, newVal: boolean | string) {
        const values:any = {}
        values[option] = newVal

        this.$store.dispatch('gui/macros/groupUpdate', {
            id: this.editGroupId,
            values
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

    @Watch('boolFormEdit')
    updatedBoolFormEdit(newVal: boolean) {
        this.updateShowGeneral(!newVal)
    }

    cancelEditMacrogroup() {
        this.boolFormEdit = false
        this.$emit('scrollToTop')
    }
}
</script>