<template>
    <div>
        <template v-if="!boolFormEdit">
            <v-card-text>
                <h3 class="text-h5 mb-3">{{ $t('Settings.MacrosTab.Macrogroups') }}</h3>
                <template v-if="groups.length">
                    <div v-for="(group, index) in groups" :key="index">
                        <v-divider v-if="index" class="my-2" />
                        <settings-row
                            :title="group.name !== '' ? group.name : '<' + $t('Settings.MacrosTab.UnknownGroup') + '>'"
                            :sub-title="
                                $tc('Settings.MacrosTab.CountMacros', 'macros' in group ? group.macros.length : 0, {
                                    count: 'macros' in group ? group.macros.length : 0,
                                })
                            "
                            :dynamic-slot-width="true">
                            <v-btn small outlined class="ml-3" @click="editMacrogroup(group)">
                                <v-icon left small>{{ mdiPencil }}</v-icon>
                                {{ $t('Settings.Edit') }}
                            </v-btn>
                            <v-btn
                                small
                                outlined
                                class="ml-3 minwidth-0 px-2"
                                color="error"
                                @click="deleteMacrogroup(group.id)">
                                <v-icon small>{{ mdiDelete }}</v-icon>
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
                <v-btn text color="primary" @click="addGroup">{{ $t('Settings.MacrosTab.AddGroup') }}</v-btn>
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
                        @change="updateGroupOptionName" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.MacrosTab.Color')">
                    <v-select
                        v-model="editGroup.color"
                        :items="groupColors"
                        outlined
                        dense
                        hide-details
                        attach
                        @change="updateGroupOptionColor" />
                </settings-row>
                <template v-if="editGroup?.color === 'custom'">
                    <v-divider class="my-2" />
                    <settings-row :title="$t('Settings.MacrosTab.CustomColor')">
                            <v-menu bottom left offset-y :close-on-content-click="false">
                                <template #activator="{ props }">
                                    <v-btn
                                        v-bind="props"
                                        :color="editGroup.colorCustom"
                                        class="minwidth-0 px-5"
                                        small />
                            </template>
                            <v-color-picker
                                :value="editGroup.colorCustom"
                                hide-mode-switch
                                mode="rgba"
                                @update:color="updateGroupOptionColorCustom" />
                        </v-menu>
                    </settings-row>
                </template>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.MacrosTab.Status')">
                        <v-tooltip top>
                            <template #activator="{ props }">
                                <v-btn
                                    small
                                    outlined
                                    v-bind="props"
                                    class="ml-3 minwidth-0 px-2"
                                    :color="editGroup?.showInStandby ? '' : 'secondary'"
                                    @click="updateGroupOptionShowInStandby(!editGroup?.showInStandby)">
                                <v-icon small>{{ mdiSleep }}</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('Settings.MacrosTab.ShowInStateStandby') }}</span>
                    </v-tooltip>
                        <v-tooltip top>
                            <template #activator="{ props }">
                                <v-btn
                                    small
                                    outlined
                                    v-bind="props"
                                    class="ml-3 minwidth-0 px-2"
                                    :color="editGroup?.showInPause ? '' : 'secondary'"
                                    @click="updateGroupOptionShowInPause(!editGroup?.showInPause)">
                                <v-icon small>{{ mdiPause }}</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('Settings.MacrosTab.ShowInStatePaused') }}</span>
                    </v-tooltip>
                        <v-tooltip top>
                            <template #activator="{ props }">
                                <v-btn
                                    small
                                    outlined
                                    v-bind="props"
                                    class="ml-3 minwidth-0 px-2"
                                    :color="editGroup?.showInPrinting ? '' : 'secondary'"
                                    @click="updateGroupOptionShowInPrinting(!editGroup?.showInPrinting)">
                                <v-icon small>{{ mdiPrinter3dNozzle }}</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('Settings.MacrosTab.ShowInStatePrinting') }}</span>
                    </v-tooltip>
                </settings-row>
                <v-divider class="my-2" />
                <h3 class="text-h5 mt-6 mb-3">{{ $t('Settings.MacrosTab.GroupMacros') }}</h3>
                <template v-if="editGroup?.macros && editGroup?.macros?.length">
                    <draggable
                        v-model="editGroupMacros"
                        handle=".handle"
                        ghost-class="ghost"
                        group="macros"
                        :force-fallback="true"
                        @change="updateMacroOrder">
                        <v-row
                            v-for="(macro, index) in editGroupMacros"
                            :key="macro.name"
                            class="my-2 mx-0"
                            :style="draggableBgStyle">
                            <v-col class="col-auto pr-0 d-flex py-2">
                                <v-icon class="handle">{{ mdiDragVertical }}</v-icon>
                            </v-col>
                            <v-col class="py-2">
                                <settings-row
                                    :key="'groupMacro_macro_' + index"
                                    :title="macro.name"
                                    :sub-title="getMacroDescription(macro.name)"
                                    :dynamic-slot-width="true">
                                    <template v-if="existsMacro(macro.name)">
                                        <v-tooltip top>
                                            <template #activator="{ props }">
                                                <v-btn
                                                    small
                                                    outlined
                                                    v-bind="props"
                                                    class="ml-3 minwidth-0 px-2"
                                                    :color="macro.color"
                                                    @click="changeColorMacroFromGroup(macro)">
                                                    <v-icon small left>{{ mdiPalette }}</v-icon>
                                                    {{ macro.color }}
                                                </v-btn>
                                            </template>
                                            <span>{{ $t('Settings.MacrosTab.ChangeMacroColor') }}</span>
                                        </v-tooltip>
                                        <v-tooltip top>
                                            <template #activator="{ props }">
                                                <v-btn
                                                    small
                                                    outlined
                                                    v-bind="props"
                                                    class="ml-3 minwidth-0 px-2"
                                                    :color="macro.showInStandby ? '' : 'secondary'"
                                                    @click="
                                                        updateMacroFromGroup(
                                                            macro,
                                                            'showInStandby',
                                                            !macro.showInStandby
                                                        )
                                                    ">
                                                    <v-icon small>{{ mdiSleep }}</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>{{ $t('Settings.MacrosTab.ShowInStateStandby') }}</span>
                                        </v-tooltip>
                                        <v-tooltip top>
                                            <template #activator="{ props }">
                                                <v-btn
                                                    small
                                                    outlined
                                                    v-bind="props"
                                                    class="ml-3 minwidth-0 px-2"
                                                    :color="macro.showInPause ? '' : 'secondary'"
                                                    @click="
                                                        updateMacroFromGroup(macro, 'showInPause', !macro.showInPause)
                                                    ">
                                                    <v-icon small>{{ mdiPause }}</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>{{ $t('Settings.MacrosTab.ShowInStatePaused') }}</span>
                                        </v-tooltip>
                                        <v-tooltip top>
                                            <template #activator="{ props }">
                                                <v-btn
                                                    small
                                                    outlined
                                                    v-bind="props"
                                                    class="ml-3 minwidth-0 px-2"
                                                    :color="macro.showInPrinting ? '' : 'secondary'"
                                                    @click="
                                                        updateMacroFromGroup(
                                                            macro,
                                                            'showInPrinting',
                                                            !macro.showInPrinting
                                                        )
                                                    ">
                                                    <v-icon small>{{ mdiPrinter3dNozzle }}</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>{{ $t('Settings.MacrosTab.ShowInStatePrinting') }}</span>
                                        </v-tooltip>
                                    </template>
                                    <v-tooltip top>
                                        <template #activator="{ props }">
                                            <v-btn
                                                small
                                                outlined
                                                v-bind="props"
                                                class="ml-3 minwidth-0 px-2"
                                                color="error"
                                                @click="removeMacroFromGroup(macro)">
                                                <v-icon small>{{ mdiDelete }}</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>{{ $t('Settings.MacrosTab.DeleteMacroFromGroup') }}</span>
                                    </v-tooltip>
                                </settings-row>
                            </v-col>
                        </v-row>
                    </draggable>
                </template>
                <template v-else>
                    <v-row>
                        <v-col>
                            <p class="mb-0 text-center font-italic">{{ $t('Settings.MacrosTab.NoMacrosInGroup') }}</p>
                        </v-col>
                    </v-row>
                </template>
                <v-row class="mt-6 mb-3 flex-column flex-md-row">
                    <v-col class="py-0 align-content-center mb-3 mb-md-0">
                        <h3 class="text-h5">{{ $t('Settings.MacrosTab.AvailableMacros') }}</h3>
                    </v-col>
                    <v-col class="py-0">
                        <v-text-field
                            v-model="searchMacros"
                            :append-icon="mdiMagnify"
                            :label="$t('Settings.MacrosTab.Search')"
                            single-line
                            outlined
                            clearable
                            hide-details
                            dense />
                    </v-col>
                </v-row>
                <template v-if="availableMacros.length">
                    <template v-for="(macro, index) in availableMacros" :key="'availableMacro_macro_' + index">
                        <v-divider v-if="index" class="my-2"></v-divider>
                        <settings-row
                            :title="macro.name"
                            :sub-title="macro.description"
                            :dynamic-slot-width="true">
                            <v-btn small outlined class="ml-3" @click="addMacroToGroup(macro)">
                                <v-icon left small>{{ mdiPlus }}</v-icon>
                                {{ $t('Settings.MacrosTab.Add') }}
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
                <v-btn text @click="cancelEditMacrogroup">{{ $t('Buttons.Close') }}</v-btn>
            </v-card-actions>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import draggable from 'vuedraggable'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import type { PrinterStateMacro } from '@/store/printer/types'
import type { GuiMacrosStateMacrogroup, GuiMacrosStateMacrogroupMacro } from '@/store/gui/macros/types'
import {
    mdiDelete,
    mdiSleep,
    mdiPause,
    mdiPrinter3dNozzle,
    mdiPlus,
    mdiDragVertical,
    mdiPalette,
    mdiPencil,
    mdiMagnify,
} from '@mdi/js'
import { clearColorObject, ColorPickerValue } from '@/plugins/helpers'
import type { DraggableChangeEvent } from '@/types/vuedraggable'

const emit = defineEmits<{
    (e: 'update:showGeneral', value: boolean): void
    (e: 'scrollToTop'): void
}>()

const store = useStore()
const { t } = useI18n()
const { draggableBgStyle } = useTheme()

const rules = {
    required: (value: string) => value !== '' || 'required',
    groupUnique: (value: string) => !existsGroupName(value) || 'Name already exists',
}

const boolFormEdit = ref(false)
const editGroupId = ref<string | null>('')
const searchMacros = ref('')

const groupColors = computed(() => [
    {
        text: t('Settings.MacrosTab.Primary'),
        value: 'primary',
    },
    {
        text: t('Settings.MacrosTab.Secondary'),
        value: 'secondary',
    },
    {
        text: t('Settings.MacrosTab.Success'),
        value: 'success',
    },
    {
        text: t('Settings.MacrosTab.Warning'),
        value: 'warning',
    },
    {
        text: t('Settings.MacrosTab.Error'),
        value: 'error',
    },
    {
        text: t('Settings.MacrosTab.Custom'),
        value: 'custom',
    },
])

const macroColors = computed(() => {
    const colors = [...groupColors.value]
    const indexCustom = colors.findIndex((color) => color.value === 'custom')
    if (indexCustom !== -1) colors.splice(indexCustom, 1)

    colors.push({
        text: t('Settings.MacrosTab.Group'),
        value: 'group',
    })

    return colors
})

const allMacros = computed(() => {
    const macros = store.getters['printer/getMacros'] ?? []
    return macros.filter((macro: PrinterStateMacro) => {
        return (
            macro.name.toLowerCase().includes(searchMacros.value.toLowerCase()) ||
            macro.description?.toLowerCase().includes(searchMacros.value.toLowerCase())
        )
    })
})

const availableMacros = computed(() => {
    return allMacros.value.filter((m: GuiMacrosStateMacrogroupMacro) => !editGroupUsedMacros.value.includes(m.name))
})

const groups = computed(() => {
    return store.getters['gui/macros/getAllMacrogroups'] ?? []
})

const editGroupUsedMacros = computed(() => {
    return editGroup.value?.macros?.map((m: GuiMacrosStateMacrogroupMacro) => m.name) ?? []
})

const editGroup = computed<GuiMacrosStateMacrogroup | null>(() => {
    return store.getters['gui/macros/getMacrogroup'](editGroupId.value)
})

const editGroupMacros = computed({
    get: () => {
        const macros = editGroup.value?.macros ?? []
        macros.sort((a: GuiMacrosStateMacrogroupMacro, b: GuiMacrosStateMacrogroupMacro) => a.pos - b.pos)
        return macros
    },
    set: () => {},
})

function existsGroupName(name: string) {
    return (
        groups.value.findIndex(
            (group: GuiMacrosStateMacrogroup) => group.name === name && group.id != editGroupId.value
        ) >= 0
    )
}

function updateShowGeneral(newVal: boolean) {
    emit('update:showGeneral', newVal)
}

async function addGroup() {
    const values = {
        name: '',
        color: 'primary',
        colorCustom: '#fff',
        showInStandby: true,
        showInPause: true,
        showInPrinting: true,
    }
    editGroupId.value = await store.dispatch('gui/macros/groupStore', { values })

    boolFormEdit.value = true
}

function editMacrogroup(group: GuiMacrosStateMacrogroup) {
    boolFormEdit.value = true
    editGroupId.value = group.id
}

function deleteMacrogroup(id: string) {
    store.dispatch('gui/macros/groupDelete', id)
}

function addMacroToGroup(macro: PrinterStateMacro) {
    store.dispatch('gui/macros/addMacroToMacrogroup', {
        id: editGroupId.value,
        macro: macro.name,
    })
}

function updateMacroFromGroup(macro: GuiMacrosStateMacrogroupMacro, option: string, value: boolean | string | number) {
    store.dispatch('gui/macros/updateMacroFromMacrogroup', {
        id: editGroupId.value,
        macro: macro.name,
        option: option,
        value: value,
    })
}

function updateMacroOrder(output: DraggableChangeEvent<GuiMacrosStateMacrogroupMacro>) {
    if (!output.moved) return

    const oldIndex = output.moved.oldIndex
    const newIndex = output.moved.newIndex
    const oldPos = editGroupMacros.value[oldIndex].pos
    const newPos = editGroupMacros.value[newIndex].pos

    updateMacroFromGroup(editGroupMacros.value[oldIndex], 'pos', newPos)
    updateMacroFromGroup(editGroupMacros.value[newIndex], 'pos', oldPos)
}

function changeColorMacroFromGroup(macro: GuiMacrosStateMacrogroupMacro) {
    let index = macroColors.value.findIndex((color) => color.value === macro.color) + 1
    const maxIndex = macroColors.value.length - 1

    if (index > maxIndex) index = 0
    const newColor = macroColors.value[index].value

    updateMacroFromGroup(macro, 'color', newColor)
}

function removeMacroFromGroup(macro: GuiMacrosStateMacrogroupMacro) {
    store.dispatch('gui/macros/removeMacroFromMacrogroup', {
        id: editGroupId.value,
        macro: macro.name,
    })
}

function existsMacro(macroname: string) {
    return (
        allMacros.value.findIndex((m: PrinterStateMacro) => m.name.toLowerCase() === macroname.toLowerCase()) !== -1
    )
}

function getMacroDescription(macroname: string) {
    const macro = allMacros.value.find((m: PrinterStateMacro) => m.name.toLowerCase() === macroname.toLowerCase())
    if (!macro) return t('Settings.MacrosTab.DeletedMacro')

    return macro?.description ?? null
}

function updateMacrogroupOption(option: string, newVal: boolean | string) {
    const values: Record<string, boolean | string> = {}
    values[option] = newVal

    store.dispatch('gui/macros/groupUpdate', {
        id: editGroupId.value,
        values,
    })
}

let updateGroupNameTimer: ReturnType<typeof setTimeout> | null = null
function updateGroupOptionName(newVal: string) {
    if (updateGroupNameTimer) clearTimeout(updateGroupNameTimer)
    updateGroupNameTimer = setTimeout(() => {
        updateMacrogroupOption('name', newVal)
    }, 250)
}

function updateGroupOptionColor(newVal: string) {
    updateMacrogroupOption('color', newVal)
}

let updateGroupColorTimer: ReturnType<typeof setTimeout> | null = null
function updateGroupOptionColorCustom(newVal: ColorPickerValue) {
    if (updateGroupColorTimer) clearTimeout(updateGroupColorTimer)
    updateGroupColorTimer = setTimeout(() => {
        updateMacrogroupOption('colorCustom', clearColorObject(newVal))
    }, 250)
}

function updateGroupOptionShowInStandby(newVal: boolean) {
    updateMacrogroupOption('showInStandby', newVal)
}

function updateGroupOptionShowInPause(newVal: boolean) {
    updateMacrogroupOption('showInPause', newVal)
}

function updateGroupOptionShowInPrinting(newVal: boolean) {
    updateMacrogroupOption('showInPrinting', newVal)
}

watch(boolFormEdit, (newVal) => {
    updateShowGeneral(!newVal)
})

function cancelEditMacrogroup() {
    boolFormEdit.value = false
    emit('scrollToTop')
}
</script>
