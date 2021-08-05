<template>
    <div>
        <v-card flat v-if="!form.bool">
            <v-card-text>
                <settings-row :title="$t('Settings.WebcamTab.ShowInNavigation')">
                    <v-switch v-model="boolNavi" hide-details class="mt-0"></v-switch>
                </settings-row>
                <div v-for="(webcam, index) in this.webcams" v-bind:key="index">
                    <v-divider class="my-2"></v-divider>
                    <settings-row :title="webcam.name" :icon="webcam.icon" :sub-title="getSubtitle(webcam)">
                        <v-btn small outlined @click="editWebcam(webcam, index)">
                            <v-icon small left>mdi-pencil</v-icon> {{ $t('Settings.Edit') }}
                        </v-btn>
                        <v-btn small outlined @click="deleteWebcam(index)" class="ml-3 minwidth-0 px-2" color="error">
                            <v-icon small>mdi-delete</v-icon>
                        </v-btn>
                    </settings-row>
                </div>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn text color="primary" @click="createWebcam">{{ $t("Settings.WebcamTab.AddWebcam")}}</v-btn>
            </v-card-actions>
        </v-card>
        <v-card flat v-else>
            <v-form v-model="form.valid" @submit.prevent="saveWebcam">
                <v-card-title>
                    {{ form.index === null ? $t("Settings.WebcamTab.CreateWebcam") : $t("Settings.WebcamTab.EditWebcam") }}
                </v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col class="col-12 col-sm-6">
                            <v-row>
                                <v-col class="col-2">
                                    <v-item-group>
                                        <v-menu :offset-y="true" title="Icon">
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-btn class="px-2 minwidth-0" color="transparent" v-bind="attrs" v-on="on" elevation="0">
                                                    <v-icon>{{ form.icon }}</v-icon>
                                                </v-btn>
                                            </template>
                                            <v-list dense class="py-0">
                                                <v-list-item v-for="icon of this.iconItems" v-bind:key="icon.value" link @click="setFormIcon(icon.value)">
                                                    <v-list-item-icon class="mr-0">
                                                        <v-icon small>{{ icon.value }}</v-icon>
                                                    </v-list-item-icon>
                                                    <v-list-item-content>
                                                        <v-list-item-title v-text="icon.text"></v-list-item-title>
                                                    </v-list-item-content>
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                    </v-item-group>
                                </v-col>
                                <v-col class="col-10">
                                    <v-text-field
                                        v-model="form.name"
                                        :label="$t('Settings.WebcamTab.Name')"
                                        hide-details="auto"
                                        :rules="[rules.required, rules.unique]"
                                        dense
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="py-1">
                                    <v-text-field
                                        v-model="form.url"
                                        :label="$t('Settings.WebcamTab.WebcamURL')"
                                        hide-details="auto"
                                        :rules="[rules.required]"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="py-1">
                                    <v-select
                                        v-model="form.service"
                                        :items="serviceItems"
                                        hide-details
                                        :label="$t('Settings.WebcamTab.Service')"
                                    ></v-select>
                                </v-col>
                            </v-row>
                            <v-row v-if="form.service === 'mjpegstreamer-adaptive'">
                                <v-col class="py-1">
                                    <v-text-field
                                        v-model="form.targetFps"
                                        hide-details
                                        :label="$t('Settings.WebcamTab.TargetFPS')"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="py-1">
                                    <v-checkbox
                                        v-model="form.flipX"
                                        hide-details
                                        class="mt-1"
                                        :label="$t('Settings.WebcamTab.FlipHorizontally')"
                                    ></v-checkbox>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="py-1">
                                    <v-checkbox
                                        v-model="form.flipY"
                                        hide-details
                                        class="mt-1"
                                        :label="$t('Settings.WebcamTab.FlipVertically')"
                                    ></v-checkbox>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col class="col-12 col-sm-6 text-center" align-self="center">
                            <vue-load-image v-if="['mjpegstreamer', 'mjpegstreamer-adaptive', 'uv4l-mjpeg'].includes(form.service)">
                                <img slot="image" :src="form.url" alt="Preview" :style="webcamStyle" class="webcamImage" />
                                <v-progress-circular slot="preloader" indeterminate color="primary"></v-progress-circular>
                                <template slot="error">
                                    <v-icon x-large>mdi-webcam-off</v-icon>
                                    <div class="subtitle-1 mt-2">{{ $t('Settings.WebcamTab.UrlNotAvailable') }}</div>
                                </template>
                            </vue-load-image>
                            <video v-if="['ipstream'].includes(form.service)" :src="form.url" autoplay :style="webcamStyle" />
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions class="d-flex justify-end">
                    <v-btn
                        text
                        @click="form.bool = false"
                    >
                        {{ $t('Settings.Cancel') }}
                    </v-btn>
                    <v-btn
                        color="primary"
                        text
                        type="submit"
                    >
                        {{ form.index === null ? $t("Settings.WebcamTab.SaveWebcam") : $t("Settings.WebcamTab.UpdateWebcam") }}
                    </v-btn>
                </v-card-actions>
            </v-form>
        </v-card>
    </div>
</template>

<script lang="ts">

import {Component, Mixins} from "vue-property-decorator";
import BaseMixin from "../mixins/base";
import SettingsRow from "@/components/settings/SettingsRow.vue";
import {GuiStateWebcam} from "@/store/gui/types";

interface webcamForm {
    bool: boolean
    index: number | null
    valid: boolean
    name: string
    icon: string
    service: string
    targetFps: number
    url: string
    flipX: boolean
    flipY: boolean
}

@Component({
    components: {SettingsRow}
})
export default class SettingsWebcamTab extends Mixins(BaseMixin) {

    private form: webcamForm = {
        bool: false,
        index: null,
        valid: false,
        name: "",
        icon: "",
        service: "",
        targetFps: 15,
        url: "",
        flipX: false,
        flipY: false,
    }

    private rules = {
        required: (value: string) => value !== "" || this.$t("Settings.WebcamTab.Required"),
        unique: (value: string) => !this.existsWebcamName(value) || this.$t("Settings.WebcamTab.NameAlreadyExists"),
    }

    get webcams() {
        return this.$store.getters["gui/getWebcams"] ?? []
    }

    get boolDashboard() {
        return this.$store.state.gui.webcam.boolDashboard ?? false
    }

    set boolDashboard(newVal) {
        this.$store.dispatch("gui/saveSetting", { name: 'webcam.boolDashboard', value: newVal })
    }

    get boolNavi() {
        return this.$store.state.gui.webcam.boolNavi ?? false
    }

    set boolNavi(newVal) {
        this.$store.dispatch("gui/saveSetting", { name: 'webcam.boolNavi', value: newVal })
    }

    get iconItems() {
        return [
            { value: "mdi-printer-3d",          text: this.$t("Settings.WebcamTab.IconPrinter") },
            { value: "mdi-printer-3d-nozzle",   text: this.$t("Settings.WebcamTab.IconNozzle") },
            { value: "mdi-radiator-disabled",   text: this.$t("Settings.WebcamTab.IconBed") },
            { value: "mdi-webcam",              text: this.$t("Settings.WebcamTab.IconCam") },
            { value: "mdi-album",               text: this.$t("Settings.WebcamTab.IconFilament") },
            { value: "mdi-door",                text: this.$t("Settings.WebcamTab.IconDoor") },
            { value: "mdi-raspberry-pi",        text: this.$t("Settings.WebcamTab.IconMcu") },
            { value: "mdi-campfire",            text: this.$t("Settings.WebcamTab.IconHot") },
        ]
    }

    get serviceItems() {
        return [
            { value: "mjpegstreamer",           text: this.$t("Settings.WebcamTab.Mjpegstreamer")},
            { value: "mjpegstreamer-adaptive",  text: this.$t("Settings.WebcamTab.MjpegstreamerAdaptive") },
            { value: "uv4l-mjpeg",              text: this.$t("Settings.WebcamTab.Uv4lMjpeg") },
            { value: "ipstream",                text: this.$t("Settings.WebcamTab.Ipstream") },
        ]
    }

    get webcamStyle() {
        let transforms = "";
        if (this.form.flipX) transforms += " scaleX(-1)"
        if (this.form.flipY) transforms += " scaleY(-1)"
        if (transforms.trimLeft().length) {
            return { transform: transforms.trimLeft() }
        }

        return ""
    }

    getSubtitle(webcam: GuiStateWebcam) {
        return webcam.url
    }

    existsWebcamName(name: string) {
        return (this.webcams.findIndex((webcam: GuiStateWebcam, index: number) => webcam.name === name && index !== this.form.index) !== -1)
    }

    createWebcam() {
        this.clearDialog()

        this.form.bool = true
    }

    editWebcam(webcam: GuiStateWebcam, index: number) {
        this.form.index = index
        this.form.name = webcam.name
        this.form.icon = webcam.icon
        this.form.service = webcam.service
        this.form.targetFps = webcam.targetFps
        this.form.url = webcam.url
        this.form.flipX = webcam.flipX
        this.form.flipY = webcam.flipY

        this.form.bool = true
        this.form.valid = false
    }

    saveWebcam() {
        if (this.form.valid) {
            if (this.form.index !== null) this.$store.dispatch("gui/updateWebcam", {...this.form})
            else this.$store.dispatch("gui/addWebcam", {...this.form})

            this.clearDialog()
        }
    }

    deleteWebcam(index: number) {
        this.$store.dispatch("gui/deleteWebcam", { index: index })
    }

    clearDialog() {
        this.form.bool = false
        this.form.index = null
        this.form.name = ""
        this.form.icon = "mdi-webcam"
        this.form.service = "mjpegstreamer-adaptive"
        this.form.targetFps = 15
        this.form.url = "/webcam/?action=stream"
        this.form.flipX = false
        this.form.flipY = false
    }

    setFormIcon(icon: string) {
        this.form.icon = icon
    }
}
</script>
