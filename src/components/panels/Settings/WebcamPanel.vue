<template>
    <div>
        <v-card>
            <v-toolbar flat dense>
                <v-toolbar-title>
                    <span class="subheading">
                        <v-icon left>mdi-webcam</v-icon>{{ $t('Settings.WebcamPanel.Webcams') }}
                    </span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-3">
                <v-container>
                    <v-row>
                        <v-col class="py-2 pb-5">
                            <v-switch
                                v-model="boolNavi"
                                hide-details
                                :label="$t('Settings.WebcamPanel.ShowInNavigation')"
                                class="mt-0"
                            ></v-switch>
                        </v-col>
                    </v-row>
                    <v-row v-for="(webcam, index) in this.webcams" v-bind:key="index">
                        <v-col class="rounded transition-swing secondary py-2 px-2 mb-3" style="cursor: pointer;" >
                            <v-row align="center">
                                <v-col class="px-4 mr-2 col-1">
                                    <v-icon left>{{ webcam.icon }}</v-icon>
                                </v-col>
                                <v-col class="col-7">
                                    <strong>{{ webcam.name }}</strong>
                                </v-col>
                                <v-col class="col-auto text-right" style="position:absolute;right:12px">
                                    <v-btn
                                        small
                                        class="minwidth-0 float-right"
                                        v-on:click.stop.prevent="editWebcam(webcam)"
                                    >
                                        <v-icon small>mdi-pencil</v-icon>
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-center mt-0">
                            <v-btn @click="createWebcam">{{ $t("Settings.WebcamPanel.AddWebcam")}}</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </v-card>
        <v-dialog v-model="dialog.bool" persistent :width="600">
            <v-card dark>
                <v-toolbar flat dense color="primary">
                    <v-toolbar-title>
                        <span class="subheading">
                            <v-icon class="mdi mdi-webcam" left></v-icon> {{ dialog.index === null ? $t("Settings.WebcamPanel.CreateWebcam") : $t("Settings.WebcamPanel.EditWebcam") }}
                        </span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn small class="minwidth-0" @click="dialog.bool = false">
                        <v-icon small>mdi-close-thick</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text class="pt-3">
                    <v-container class="pb-0">
                        <v-form v-model="dialog.valid" @submit.prevent="saveWebcam">
                            <template v-if="dialog.bool">
                                <v-row>
                                    <v-col class="col-12 col-sm-6">
                                        <v-row>
                                            <v-col class="col-2">
                                                <v-item-group>
                                                    <v-menu :offset-y="true" title="Icon">
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-btn class="px-2 minwidth-0" color="transparent" v-bind="attrs" v-on="on" elevation="0">
                                                                <v-icon>{{ getCurrentIcon() }}</v-icon>
                                                            </v-btn>
                                                        </template>
                                                        <v-list dense class="py-0">
                                                            <v-list-item v-for="icon of this.iconItems" v-bind:key="icon.value" link @click="setCurrentIcon(icon.value)">
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
                                                    v-model="dialog.name"
                                                    :label="$t('Settings.WebcamPanel.Name')"
                                                    hide-details="auto"
                                                    :rules="[rules.required, rules.unique]"
                                                    dense
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col class="py-1">
                                                <v-text-field
                                                    v-model="dialog.url"
                                                    :label="$t('Settings.WebcamPanel.WebcamURL')"
                                                    hide-details="auto"
                                                    :rules="[rules.required]"
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col class="py-1">
                                                <v-select
                                                    v-model="dialog.service"
                                                    :items="serviceItems"
                                                    hide-details
                                                    :label="$t('Settings.WebcamPanel.Service')"
                                                ></v-select>
                                            </v-col>
                                        </v-row>
                                        <v-row v-if="dialog.service === 'mjpegstreamer-adaptive'">
                                            <v-col class="py-1">
                                                <v-text-field
                                                    v-model="dialog.targetFps"
                                                    hide-details
                                                    :label="$t('Settings.WebcamPanel.TargetFPS')"
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col class="py-1">
                                                <v-checkbox
                                                    v-model="dialog.flipX"
                                                    hide-details
                                                    class="mt-1"
                                                    :label="$t('Settings.WebcamPanel.FlipHorizontally')"
                                                ></v-checkbox>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col class="py-1">
                                                <v-checkbox
                                                    v-model="dialog.flipY"
                                                    hide-details
                                                    class="mt-1"
                                                    :label="$t('Settings.WebcamPanel.FlipVertically')"
                                                ></v-checkbox>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                    <v-col class="col-12 col-sm-6 text-center" align-self="center">
                                        <vue-load-image v-if="['mjpegstreamer', 'mjpegstreamer-adaptive', 'uv4l-mjpeg'].includes(dialog.service)">
                                            <img slot="image" :src="dialog.url" alt="Preview" :style="webcamStyle" class="webcamImage" />
                                            <v-progress-circular slot="preloader" indeterminate color="primary"></v-progress-circular>
                                            <template slot="error">
                                                <v-icon x-large>mdi-webcam-off</v-icon>
                                                <div class="subtitle-1 mt-2">{{ $t('Settings.WebcamPanel.UrlNotAvailable') }}</div>
                                            </template>
                                        </vue-load-image>
                                        <video v-if="['ipstream'].includes(dialog.service)" :src="dialog.url" autoplay :style="webcamStyle" />
                                    </v-col>
                                </v-row>
                                <v-row class="mt-3">
                                    <v-col class="text-center">
                                        <v-btn
                                            color="red"
                                            outlined
                                            class="float-left minwidth-0"
                                            @click="deleteWebcam"
                                            v-if="this.dialog.index !== null"
                                        >
                                            <v-icon>mdi-delete</v-icon>
                                        </v-btn>
                                        <v-btn
                                            color="white"
                                            outlined
                                            :class="dialog.index !== null ? 'float-right' : ''"
                                            type="submit"
                                        >
                                            {{ dialog.index === null ? $t("Settings.WebcamPanel.SaveWebcam") : $t("Settings.WebcamPanel.UpdateWebcam") }}
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </template>
                        </v-form>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>

import VueLoadImage from "vue-load-image"

export default {
    components: {
        'vue-load-image': VueLoadImage
    },
    data: function () {
        return {
            dialog: {
                bool: false,
                index: null,
                valid: false,
                name: "",
                icon: "mdi-webcam",
                service: "mjpegstreamer-adaptive",
                targetFps: 15,
                url: "/webcam/?action=stream",
                flipX: false,
                flipY: false,
            },
            rules: {
                required: (value) => value !== "" || this.$t("Settings.WebcamPanel.Required"),
                unique: (value) => !this.existsWebcamName(value) || this.$t("Settings.WebcamPanel.NameAlreadyExists"),
            },
            iconItems: [
                { value: "mdi-printer-3d",          text: this.$t("Settings.WebcamPanel.IconPrinter") },
                { value: "mdi-printer-3d-nozzle",   text: this.$t("Settings.WebcamPanel.IconNozzle") },
                { value: "mdi-radiator-disabled",   text: this.$t("Settings.WebcamPanel.IconBed") },
                { value: "mdi-webcam",              text: this.$t("Settings.WebcamPanel.IconCam") },
                { value: "mdi-album",               text: this.$t("Settings.WebcamPanel.IconFilament") },
                { value: "mdi-door",                text: this.$t("Settings.WebcamPanel.IconDoor") },
                { value: "mdi-raspberry-pi",        text: this.$t("Settings.WebcamPanel.IconMcu") },
                { value: "mdi-campfire",            text: this.$t("Settings.WebcamPanel.IconHot") },
            ],
            serviceItems: [
                { value: "mjpegstreamer",           text: this.$t("Settings.WebcamPanel.Mjpegstreamer")},
                { value: "mjpegstreamer-adaptive",  text: this.$t("Settings.WebcamPanel.MjpegstreamerAdaptive") },
                { value: "uv4l-mjpeg",              text: this.$t("Settings.WebcamPanel.Uv4lMjpeg") },
                { value: "ipstream",                text: this.$t("Settings.WebcamPanel.Ipstream") },
            ],
        };
    },
    computed: {
        webcams: {
            get() {
                return this.$store.getters["gui/getWebcams"]
            },
        },
        boolNavi: {
            get() {
                return this.$store.state.gui.webcam.bool
            },
            set(showNav) {
                return this.$store.dispatch("gui/setSettings", {
                    webcam: {bool: showNav},
                })
            },
        },
        webcamStyle() {
            let transforms = "";
            if (this.dialog.flipX) transforms += " scaleX(-1)"
            if (this.dialog.flipY) transforms += " scaleY(-1)"
            if (transforms.trimLeft().length) {
                return { transform: transforms.trimLeft() }
            }

            return ""
        },
    },
    mounted() {
        this.clearDialog()
    },
    methods: {
        getCurrentIcon() {
            return this.dialog.icon
        },
        setCurrentIcon(icon) {
            this.dialog.icon = icon
        },
        existsWebcamName(name) {
            return (this.webcams.findIndex(webcam => webcam.name === name && webcam.index !== this.dialog.index) !== -1)
        },
        createWebcam() {
            this.clearDialog()

            this.dialog.bool = true
        },
        clearDialog() {
            this.dialog.bool = false
            this.dialog.index = null
            this.dialog.name = ""
            this.dialog.icon = "mdi-webcam"
            this.dialog.service = "mjpegstreamer-adaptive"
            this.dialog.targetFps = 15
            this.dialog.url = "/webcam/?action=stream"
            this.dialog.flipX = false
            this.dialog.flipY = false
        },
        editWebcam(webcam) {
            this.dialog.name = webcam.name
            this.dialog.icon = webcam.icon
            this.dialog.index = webcam.index
            this.dialog.service = webcam.service
            this.dialog.targetFps = webcam.targetFps
            this.dialog.url = webcam.url
            this.dialog.flipX = webcam.flipX
            this.dialog.flipY = webcam.flipY

            this.dialog.bool = true
        },
        saveWebcam() {
            if (this.dialog.valid) {
                if (this.dialog.index) this.$store.dispatch("gui/updateWebcam", {...this.dialog})
                else this.$store.dispatch("gui/addWebcam", {...this.dialog})

                this.clearDialog()
            }
        },
        deleteWebcam() {
            this.$store.dispatch("gui/deleteWebcam", this.dialog)

            this.clearDialog()
        },
    },
}
</script>
