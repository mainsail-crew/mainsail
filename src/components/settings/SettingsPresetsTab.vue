
<template>
    <div class="theme-settings theme-presets-tab-settings">
        <v-card flat v-if="!form.bool && !cooldownForm.bool">
            <v-card-text>
                <div v-for="(preset, index) in presets" v-bind:key="index">
                    <v-divider class="my-2" v-if="index"></v-divider>
                    <settings-row :title="preset.name" :sub-title="getSubTitle(preset)">
                        <v-btn small outlined class="ml-3" @click="editPreset(preset)">
                            <v-icon left small>mdi-pencil</v-icon>{{ $t('Settings.Edit') }}
                        </v-btn>
                        <v-btn small outlined @click="deletePreset(preset.index)" class="ml-3 minwidth-0 px-2" color="error">
                            <v-icon small>mdi-delete</v-icon>
                        </v-btn>
                    </settings-row>
                </div>
                <v-divider class="my-2" v-if="presets.length"></v-divider>
                <settings-row :title="$t('Settings.PresetsTab.Cooldown')">
                    <v-btn small outlined class="ml-3" @click="editCooldown">
                        <v-icon left small>mdi-pencil</v-icon>{{ $t('Settings.Edit') }}
                    </v-btn>
                </settings-row>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text color="primary" @click="createPreset">{{ $t("Settings.PresetsTab.AddPreset")}}</v-btn>
            </v-card-actions>
        </v-card>
        <v-card flat v-else-if="form.bool">
            <v-form v-model="form.valid" @submit.prevent="savePreset" >
                <v-card-title>{{ form.index === null ? $t('Settings.PresetsTab.CreateHeadline') : $t('Settings.PresetsTab.EditHeadline') }}</v-card-title>
                <v-card-text>
                    <v-row class="mt-3" v-if="form.boolInvalidMin">
                        <v-col class="py-0">
                            <v-alert dense text type="error">{{ $t('Settings.PresetsTab.PresetInfo')}}</v-alert>
                        </v-col>
                    </v-row>
                    <settings-row :title="$t('Settings.PresetsTab.Name')">
                        <v-text-field
                            v-model="form.name"
                            hide-details="auto"
                            :rules="[rules.required, rules.unique]"
                            dense
                            outlined
                        ></v-text-field>
                    </settings-row>
                    <div v-for="(heater) of heaters" v-bind:key="heater.name">
                        <v-divider class="my-2"></v-divider>
                        <settings-row :title="convertName(heater.name)">
                            <v-checkbox
                                v-model="form.values[heater.name].bool"
                                hide-details
                                class="shrink mt-0"
                            ></v-checkbox>
                            <v-text-field
                                v-model="form.values[heater.name].value"
                                hide-details="auto"
                                type="number"
                                suffix="°C"
                                dense
                                outlined
                            ></v-text-field>
                        </settings-row>
                    </div>
                    <div v-for="(fan) of temperatureFans" v-bind:key="'temperature_fan '+fan.name">
                        <v-divider class="my-2"></v-divider>
                        <settings-row :title="convertName(fan.name)">
                            <v-checkbox
                                v-model="form.values['temperature_fan '+fan.name].bool"
                                hide-details
                                class="shrink mt-0"
                            ></v-checkbox>
                            <v-text-field
                                v-model="form.values['temperature_fan '+fan.name].value"
                                hide-details="auto"
                                type="number"
                                suffix="°C"
                                dense
                                outlined
                            ></v-text-field>
                        </settings-row>
                    </div>
                    <v-divider class="my-2"></v-divider>
                    <settings-row :title="$t('Settings.PresetsTab.CustomGCode')">
                        <v-textarea
                            outlined
                            v-model="form.gcode"
                            hide-details
                        ></v-textarea>
                    </settings-row>
                </v-card-text>
                <v-card-actions class="d-flex justify-end">
                    <v-btn text @click="form.bool = false" >
                        {{ $t('Settings.Cancel') }}
                    </v-btn>
                    <v-btn color="primary" text type="submit" >
                        {{ form.index === null ? $t("Settings.PresetsTab.StoreButton") : $t("Settings.PresetsTab.UpdateButton") }}
                    </v-btn>
                </v-card-actions>
            </v-form>
        </v-card>
        <v-card flat v-else-if="cooldownForm.bool">
            <v-form v-model="cooldownForm.valid" @submit.prevent="saveCooldown">
                <v-card-title>{{ $t('Settings.PresetsTab.EditCooldown') }}</v-card-title>
                <v-card-text>
                    <settings-row :title="$t('Settings.PresetsTab.CustomGCode')">
                        <v-textarea
                            outlined
                            v-model="cooldownForm.gcode"
                            hide-details
                        ></v-textarea>
                    </settings-row>
                </v-card-text>
                <v-card-actions class="d-flex justify-end">
                    <v-btn text @click="cooldownForm.bool = false" >
                        {{ $t('Settings.Cancel') }}
                    </v-btn>
                    <v-btn color="primary" text type="submit" >
                        {{ $t('Settings.PresetsTab.UpdateCooldown') }}
                    </v-btn>
                </v-card-actions>
            </v-form>
        </v-card>
    </div>
</template>

<script lang="ts">

import {convertName} from "@/plugins/helpers";
import {Component, Mixins} from "vue-property-decorator";
import BaseMixin from "../mixins/base";
import SettingsRow from "@/components/settings/SettingsRow.vue";
import {GuiStatePreset} from "@/store/gui/types";

interface presetForm {
    bool: boolean
    valid: boolean
    name: string
    gcode: string
    index: number | null
    boolInvalidMin: boolean
    values: {
        [key: string]: {
            bool: boolean
            value: number
            type: 'heater' | 'temperature_fan'
        }
    }
}

@Component({
    components: {SettingsRow}
})
export default class SettingsPresetsTab extends Mixins(BaseMixin) {
    convertName = convertName

    private form: presetForm = {
        bool: false,
        valid: false,
        name: "",
        gcode: "",
        index: null,
        boolInvalidMin: false,
        values: {}
    }

    private cooldownForm = {
        bool: false,
        valid: false,
        gcode: ""
    }

    private rules = {
        required: (value: string) => value !== '' || 'required',
        unique: (value: string) => !this.existsPresetName(value) || 'Name already exists',
    }

    get presets() {
        return this.$store.getters['gui/getPreheatPresets'] ?? []
    }

    get heaters() {
        return this.$store.getters['printer/getHeaters'] ?? []
    }

    get temperatureFans() {
        return this.$store.getters['printer/getTemperatureFans'] ?? []
    }

    get cooldownGcode() {
        return this.$store.state.gui.cooldownGcode ?? ""
    }

    existsPresetName(name: string) {
        return (this.presets.findIndex((preset: GuiStatePreset, index: number) => preset.name === name && index != this.form.index) >= 0)
    }

    getSubTitle(preset: GuiStatePreset) {
        let output: string[] = []

        Object.keys(preset.values).forEach((key: string) => {
            const values = preset.values[key]

            if (values.bool) {
                const name = key.indexOf(" ") ? key.slice(key.indexOf(" ") + 1) : key

                output.push(this.convertName(name)+": "+values.value+"°C")
            }
        })

        if (preset.gcode) output.push(this.$t('Settings.PresetsTab.CustomGCode').toString())

        return output.join(", ")
    }

    createPreset() {
        this.clearForm()
        this.form.bool = true
    }

    clearForm() {
        this.form.bool = false
        this.form.index = null
        this.form.name = ""
        this.form.gcode = ""
        this.form.boolInvalidMin = false
        this.form.values = {}

        for(const heater of this.heaters) {
            this.form.values[heater.name] = {
                bool: true,
                value: 0,
                type: 'heater',
            }
        }

        for(const fan of this.temperatureFans) {
            this.form.values['temperature_fan '+fan.name] = {
                bool: true,
                value: 0,
                type: 'temperature_fan',
            }
        }
    }

    editPreset(preset: any) {
        this.form.name = preset.name
        this.form.index = preset.index
        this.form.gcode = preset.gcode
        this.form.values = {}

        for(const heater of this.heaters) {
            if (heater.name in preset.values)
                this.form.values[heater.name] = {...preset.values[heater.name]}
            else
                this.form.values[heater.name] = {
                    bool: false,
                    value: 0,
                    type: 'heater',
                }
        }

        for(const fan of this.temperatureFans) {
            if ('temperature_fan '+fan.name in preset.values)
                this.form.values['temperature_fan '+fan.name] = {...preset.values['temperature_fan '+fan.name]}
            else
                this.form.values['temperature_fan '+fan.name] = {
                    bool: false,
                    value: 0,
                    type: 'temperature_fan',
                }
        }

        this.form.bool = true
    }

    savePreset() {
        let setValues = 0
        for (const key of Object.keys(this.form.values)) {
            if (this.form.values[key].bool) setValues++
        }
        if (this.form.gcode.length) setValues++

        if (setValues === 0) this.form.boolInvalidMin = true
        else if (this.form.valid) {
            if (this.form.index) {
                this.$store.dispatch('gui/updatePreset',  this.form )
            } else this.$store.dispatch('gui/addPreset',  this.form )

            this.clearForm()
        }
    }

    editCooldown() {
        this.cooldownForm.gcode = this.cooldownGcode
        this.cooldownForm.bool = true
    }

    saveCooldown() {
        if (this.cooldownForm.valid) {
            this.$store.dispatch("gui/saveSetting", { name: 'cooldownGcode', value: this.cooldownForm.gcode })
            this.cooldownForm.bool = false
        }
    }

    deletePreset(index: number) {
        this.$store.dispatch('gui/deletePreset',  { index: index } )
    }
}
</script>