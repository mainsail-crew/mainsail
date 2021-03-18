<template>
  <div>
    <v-card>
      <v-toolbar flat dense>
        <v-toolbar-title>
          <span class="subheading"
            ><v-icon left>mdi-camera</v-icon>Webcams</span
          >
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-switch
          v-model="boolNavi"
          hide-details
          label="Show in navigation"
          class="mt-0"
        ></v-switch>
      </v-toolbar>
      <v-card-text class="py-3">
        <v-container>
          <v-row
            v-for="(webcam, index) in this['gui/getWebcams']"
            v-bind:key="index"
          >
            <v-col
              class="rounded transition-swing secondary py-2 px-2 mb-3"
              style="cursor: pointer;"
            >
              <v-row align="center">
                <v-col class="pl-6">
                  <strong>{{ webcam.name }}</strong>
                </v-col>
                <v-col class="col-6">
                  {{ webcam }}
                </v-col>
                <v-col class="col-auto text-right"
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
              <v-icon class="mdi mdi-camera" left></v-icon>
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
                      <v-col class="col-12">
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
                    <v-row class="mt-2 mx-0 mb-2" align="center">
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
                      {{ this.dialog }}
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
                      {{ dialog.index === null ? "store" : "update" }} webcam
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
import { mapState, mapGetters } from "vuex";

export default {
  components: {},
  data: function() {
    return {
      dialog: {
        bool: false,
        index: null,
        valid: false,
        name: "",
        config: {
          service: "mjpegstreamer",
          targetFps: 25,
          url: "/webcam/?action=stream",
          flipX: false,
          flipY: false,
          bool: false,
        },
      },
      rules: {
        required: (value) => value !== "" || "required",
        unique: (value) =>
          !this.existsWebcamName(value) || "Name already exists",
      },
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
    ...mapState({
      orgState: (state) => state.gui.webcams,
    }),
    ...mapGetters(["gui/getWebcams"]),
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
    existsWebcamName(name) {
      return (
        this["gui/getWebcams"].findIndex(
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
      this.dialog.config.service = "mjpegstreamer";
      this.dialog.config.targetFps = 25;
      this.dialog.config.url = "/webcam/?action=stream";
      this.dialog.config.flipX = false;
      this.dialog.config.flipY = false;
      this.dialog.config.bool = false;
    },
    editWebcam(webcam) {
      console.log(webcam);
      this.dialog.name = webcam.name;
      this.dialog.index = webcam.index;
      this.dialog.config.service = webcam.config.service;
      this.dialog.config.targetFps = webcam.config.targetFps;
      this.dialog.config.url = webcam.config.url;
      this.dialog.config.flipX = webcam.config.flipX;
      this.dialog.config.flipY = webcam.config.flipY;
      this.dialog.config.bool = webcam.config.bool;

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
