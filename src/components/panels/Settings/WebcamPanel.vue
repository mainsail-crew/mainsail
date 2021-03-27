<template>
  <div>
    <v-card>
      <v-toolbar flat dense>
        <v-toolbar-title>
          <span class="subheading"
            ><v-icon left>mdi-webcam</v-icon>{{ $t('Settings.WebcamPanel.Webcam') }}</span
          >
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text class="py-3">
        <v-container>
         <v-row>
              <v-col class="py-2 pb-5">
                <v-switch
                  v-model="boolNavi"
                  hide-details
                  label="Show in navigation"
                  class="mt-0"
                ></v-switch>
              </v-col>
          </v-row>
          <v-row
            v-for="(webcam, index) in this.webcams"
            v-bind:key="index"
          >
            <v-col
              class="rounded transition-swing secondary py-2 px-2 mb-3"
              style="cursor: pointer;"
            >
              <v-row align="center">
                <v-col class="px-4 mr-2 col-1">
                  <v-icon left>{{webcam.icon}}</v-icon>
                </v-col>
                <v-col class="col-7">
                  <strong>{{ webcam.name }}</strong>
                </v-col>
                <v-col class="col-auto text-right" style="position:absolute;right:12px"
                  ><v-btn
                    small
                    class="minwidth-0 float-right"
                    v-on:click.stop.prevent="editWebcam(webcam)"
                    ><v-icon small>mdi-pencil</v-icon></v-btn
                  ></v-col
                >
              </v-row>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="text-center mt-0">
              <v-btn @click="createWebcam">add webcam</v-btn>
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
              <v-icon class="mdi mdi-webcam" left></v-icon>
              {{ dialog.index === null ? "Create" : "Edit" }} Webcam
            </span>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn small class="minwidth-0" @click="dialog.bool = false"
            ><v-icon small>mdi-close-thick</v-icon></v-btn
          >
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
                                    <v-btn class="px-2 minwidth-0" color="transparent" v-bind="attrs" v-on="on" elevation="0"><v-icon>{{getCurrentIcon()}}</v-icon></v-btn>
                                </template>
                                <v-list dense class="py-0">
                                    <v-list-item v-for="icon of this.iconItems" v-bind:key="icon.value" link @click="setCurrentIcon(icon.value)">
                                        <v-list-item-icon class="mr-0">
                                            <v-icon small>{{icon.value}}</v-icon>
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
                          label="Name"
                          hide-details="auto"
                          :rules="[rules.required, rules.unique]"
                          dense
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row class="mt-2 mx-0 mb-2" align="center">
                      <v-text-field
                        v-model="dialog.config.url"
                        label="URL"
                        hide-details="auto"
                        :rules="[rules.required, rules.urlvalid]"
                      ></v-text-field>
                    </v-row>
                    <v-row class="mt-2 mx-0 mb-2" align="center">
                      <v-select
                        v-model="dialog.config.service"
                        :items="serviceItems"
                        hide-details
                        label="Service"
                        class="mt-0"
                      ></v-select>
                    </v-row>
                    <v-row
                      class="mt-2 mx-0 mb-2"
                      align="center"
                      v-if="dialog.config.service === 'mjpegstreamer-adaptive'"
                    >
                      <v-text-field
                        v-model="dialog.config.targetFps"
                        hide-details
                        label="Target FPS"
                        class="mt-0"
                      ></v-text-field>
                    </v-row>
                    <v-row class="mt-2 mx-0 mb-2" align="center">
                      <v-checkbox
                        v-model="dialog.config.flipX"
                        hide-details
                        class="shrink mt-0"
                        label="Flip webcam horizontally"
                      ></v-checkbox>
                    </v-row>
                    <v-row class="mt-2 mx-0 mb-2" align="center">
                      <v-checkbox
                        v-model="dialog.config.flipY"
                        hide-details
                        class="shrink mt-0"
                        label="Flip webcam vertically"
                      ></v-checkbox>
                    </v-row>
                  </v-col>
                  <v-col class="col-12 col-sm-6">
                    <v-row class="mt-2 mx-0 mb-2" align="center" style="
                        height: 100%;
                        margin-top: auto!important;
                        margin-bottom: auto!important;">
                      <img
                        :src="dialog.config.url"
                        class="webcamImage"
                        :style="webcamStyle"
                        alt="Webcam"
                        v-if="
                          ['mjpegstreamer', 'mjpegstreamer-adaptive'].includes(
                            dialog.config.service
                          )
                        "
                      />
                    </v-row>
                    <v-row class="mt-2 mx-0 mb-2" align="center">
                    </v-row>
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
                      {{ dialog.index === null ? "save" : "update" }} webcam
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
import { mapGetters } from "vuex";

export default {
  components: {},
  data: function() {
    return {
      dialog: {
        bool: false,
        index: null,
        valid: false,
        name: "",
        icon: "mdi-webcam",
        config: {
          service: "mjpegstreamer",
          targetFps: 25,
          url: "/webcam/?action=stream",
          flipX: false,
          flipY: false,
        },
      },
      rules: {
        required: (value) => value !== "" || "required",
        unique: (value) =>
          !this.existsWebcamName(value) || "Name already exists",
      },
      iconItems: [
        { value: "mdi-printer-3d", text: "Printer" },
        { value: "mdi-printer-3d-nozzle", text: "Nozzle" },
        { value: "mdi-radiator-disabled", text: "Bed" },
        { value: "mdi-webcam", text: "Cam" },
        { value: "mdi-album", text: "Filament" },
        { value: "mdi-door", text: "Door" },
        { value: "mdi-raspberry-pi", text: "MCU" },
        { value: "mdi-campfire", text: "Hot" },
      ],
      serviceItems: [
        { value: "mjpegstreamer", text: "MJPEG-Streamer" },
        {
          value: "mjpegstreamer-adaptive",
          text: "Adaptive MJPEG-Streamer (experimental)",
        },
      ],
    };
  },
  computed: {
    ...mapGetters({
      webcams: 'gui/getWebcams'
    }),
    boolNavi: {
      get() {
        return this.$store.state.gui.webcam.bool;
      },
      set(showNav) {
        return this.$store.dispatch("gui/setSettings", {
          webcam: { bool: showNav },
        });
      },
    },
    webcamStyle() {
      let transforms = "";
      if (this.dialog.config.flipX) {
        transforms += " scaleX(-1)";
      }
      if (this.dialog.config.flipY) {
        transforms += " scaleY(-1)";
      }
      if (transforms.trimLeft().length) {
        return {
          transform: transforms.trimLeft(),
        };
      }
      return "";
    },
  },
  mounted() {
    this.clearDialog();
  },
  methods: {
    getDefaultConfig(){
      return {
        service: "mjpegstreamer",
        targetFps: 25,
        url: "/webcam/?action=stream",
        flipX: false,
        flipY: false,
      }
    },
    getCurrentIcon(){
      return this.dialog.icon
    },
    setCurrentIcon(icon){
      this.dialog.icon = icon
    },
    existsWebcamName(name) {
      return (
        this.webcams.findIndex(
          (webcam) => webcam.name === name && webcam.index !== this.dialog.index
        ) >= 0
      );
    },
    createWebcam() {
      this.clearDialog();
      this.dialog.bool = true;
    },
    clearDialog() {
      this.dialog.bool = false;
      this.dialog.index = null;
      this.dialog.name = "";
      this.dialog.icon = "mdi-webcam"
      this.dialog.config = this.getDefaultConfig();
    },
    editWebcam(webcam) {
      this.dialog.name = webcam.name;
      this.dialog.icon = webcam.icon;
      this.dialog.index = webcam.index;
      this.dialog.config = webcam.config;

      this.dialog.bool = true;
    },
    saveWebcam() {
      if (this.dialog.valid) {
        if (this.dialog.index) {
          this.$store.dispatch("gui/updateWebcam", this.dialog);
        } else this.$store.dispatch("gui/addWebcam", this.dialog);
        this.clearDialog();
      }
    },
    deleteWebcam() {
      this.$store.dispatch("gui/deleteWebcam", this.dialog);
      this.clearDialog();
    },
  },
};
</script>
