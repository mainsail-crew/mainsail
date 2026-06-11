<template>
    <v-card flat>
        <v-form v-model="valid" @submit.prevent="savePreset">
            <v-card-title>{{ title }}</v-card-title>
            <v-card-text>
                <v-row v-if="boolInvalidMin" class="mt-3">
                    <v-col class="py-0">
                        <v-alert dense text type="error">{{ $t('Settings.PresetsTab.PresetInfo') }}</v-alert>
                    </v-col>
                </v-row>
                <settings-row :title="$t('Settings.PresetsTab.Name')">
                    <v-text-field
                        v-model="form.name"
                        :placeholder="$t('Settings.PresetsTab.PresetNamePlaceholder')"
                        hide-details
                        :rules="[rules.required, rules.unique]"
                        dense
                        outlined />
                </settings-row>
                <div v-for="(value, key) of form.values" :key="key">
                    <v-divider class="my-2" />
                    <settings-row :title="converNameObject(key)">
                        <v-checkbox v-model="value.bool" hide-details class="shrink mt-0" />
                        <v-text-field
                            v-model="value.value"
                            hide-details
                            :rules="[rules.invalid]"
                            type="number"
                            suffix="°C"
                            dense
                            outlined
                            hide-spin-buttons
                            @focus="$event.target.select()" />
                    </settings-row>
                </div>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.PresetsTab.CustomGCode')">
                    <v-textarea v-model="form.gcode" outlined hide-details />
                </settings-row>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn variant="text" @click="closeForm">
                    {{ $t('Buttons.Cancel') }}
                </v-btn>
                <v-btn color="primary" variant="text" type="submit" :disabled="!valid">
                    {{ storeButtonText }}
                </v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { GuiPresetsStatePreset } from '@/store/gui/presets/types'
import { convertName } from '@/plugins/helpers'

const props = defineProps({
    preset: { type: Object, required: true },
})

const emit = defineEmits<{
    (e: 'close'): void
}>()

const store = useStore()
const { t } = useI18n()

const valid = ref(false)
const boolInvalidMin = ref(false)

const form = reactive({
    name: (props.preset as GuiPresetsStatePreset).name,
    gcode: (props.preset as GuiPresetsStatePreset).gcode,
    values: { ...(props.preset as GuiPresetsStatePreset).values },
})

const rules = {
    required: (value: string) => value !== '' || t('Settings.PresetsTab.ErrorNameRequired'),
    unique: (value: string) => !existsPresetName(value) || t('Settings.PresetsTab.ErrorNameNotUnique'),
    invalid: (value: string) => parseFloat(value) >= 0 || t('Settings.PresetsTab.ErrorInvalidValue'),
}

const title = computed(() => {
    if ((props.preset as GuiPresetsStatePreset).id === null) return t('Settings.PresetsTab.CreateHeadline')
    return t('Settings.PresetsTab.EditHeadline')
})

const storeButtonText = computed(() => {
    if ((props.preset as GuiPresetsStatePreset).id === null) return t('Settings.PresetsTab.StoreButton')
    return t('Settings.PresetsTab.UpdateButton')
})

const presets = computed(() => store.getters['gui/presets/getPresets'] ?? [])

const available_heaters = computed(() =>
    (store.state.printer?.heaters?.available_heaters ?? []).sort()
)

const available_temperature_fans = computed(() =>
    (store.state.printer?.heaters?.available_sensors ?? [])
        .filter((name: string) => name.startsWith('temperature_fan '))
        .sort()
)

onMounted(() => {
    const presetValues = Object.keys(form.values)

    available_heaters.value
        .filter((name: string) => !presetValues.includes(name))
        .forEach((name: string) => {
            form.values[name] = { bool: false, type: 'heater', value: 0 }
        })

    available_temperature_fans.value
        .filter((name: string) => !presetValues.includes(name))
        .forEach((name: string) => {
            form.values[name] = { bool: false, type: 'temperature_fan', value: 0 }
        })

    presetValues
        .filter(
            (name: string) =>
                !available_heaters.value.includes(name) && !available_temperature_fans.value.includes(name)
        )
        .forEach((name) => {
            delete form.values[name]
        })
})

function existsPresetName(name: string) {
    return (
        presets.value.findIndex(
            (preset: GuiPresetsStatePreset) => preset.name === name && preset.id !== (props.preset as GuiPresetsStatePreset).id
        ) !== -1
    )
}

function converNameObject(name: string) {
    return convertName(name.replace('temperature_fan ', ''))
}

function closeForm() {
    emit('close')
}

function savePreset() {
    let setValues = 0
    for (const key of Object.keys(form.values)) {
        if (form.values[key].bool) setValues++
    }
    if (form.gcode.length) setValues++

    if (setValues === 0) {
        boolInvalidMin.value = true
        return
    }

    const presetData: GuiPresetsStatePreset = {
        name: form.name,
        gcode: form.gcode,
        values: form.values,
    }

    if ((props.preset as GuiPresetsStatePreset).id === null) {
        store.dispatch('gui/presets/store', { values: presetData })
        closeForm()
        return
    }

    presetData.id = (props.preset as GuiPresetsStatePreset).id
    store.dispatch('gui/presets/update', { id: (props.preset as GuiPresetsStatePreset).id, values: presetData })
    closeForm()
}
</script>
