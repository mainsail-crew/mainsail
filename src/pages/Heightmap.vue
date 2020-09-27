<style>

</style>

<template>
    <div>
        <v-row>
            <v-col class="col-12 col-md-8">
                <v-card>
                    <v-list-item>
                        <v-list-item-avatar color="grey"><v-icon dark>mdi-grid</v-icon></v-list-item-avatar>
                        <v-list-item-content>
                            <v-list-item-title class="headline">Heightmap</v-list-item-title>
                            <v-list-item-subtitle class="mr-3" v-if="boolShowBedMesh">Current profile: {{ this.bed_mesh ? this.bed_mesh.profile_name : "unknown" }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-divider class="my-2"></v-divider>
                    <v-card-text class="px-0 py-0 content" v-if="boolShowBedMesh">
                        <Plotly ref="heightmap" :data="data" :layout="layout" :display-mode-bar="false"></Plotly>
                    </v-card-text>
                    <v-card-text v-if="!boolShowBedMesh">
                        No bed_mesh has been loaded yet.
                    </v-card-text>
                    <v-card-actions v-if="boolShowBedMesh">
                        <v-spacer></v-spacer>
                        <v-btn text :color="(this.showMeshType === 'probed' ? 'primary accent-4' : 'grey lighten-2')" @click="switchToProbed">Probed</v-btn>
                        <v-btn text :color="(this.showMeshType === 'mesh' ? 'primary accent-4' : 'grey lighten-2')" @click="switchToMesh">Mesh</v-btn>
                        <v-spacer></v-spacer>
                    </v-card-actions>
                </v-card>
            </v-col>
            <v-col class="col-12 col-md-4">
                <v-card>
                    <v-list-item>
                        <v-list-item-avatar color="grey"><v-icon dark>mdi-cogs</v-icon></v-list-item-avatar>
                        <v-list-item-content>
                            <v-list-item-title class="headline">Profile</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-divider class="my-2"></v-divider>
                    <v-card-text>
                        <v-row>
                            <v-col class="col-12">
                                <v-select
                                    :items="profiles"
                                    v-model="profile"
                                    item-text="name"
                                    item-value="name"
                                    label="Profile"
                                    outlined
                                ></v-select>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="col-12">
                                <v-btn color="primary" class="mr-3" @click="loadProfile" :loading="loadingLoad" :disabled="disabledLoad">LOAD</v-btn>
                                <v-btn color="primary" class="mr-3" @click="saveDialog = true; newName = profile" :loading="loadingSave" :disabled="disabledSave">SAVE</v-btn>
                                <v-btn color="primary" class="mr-3" @click="removeDialog = true" :loading="loadingRemove" :disabled="disabledRemove">REMOVE</v-btn>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="col-12">
                                <v-btn color="primary" class="mr-3" @click="clearBedMesh" :loading="loadingClear" :disabled="disabledClear">CLEAR</v-btn>
                                <v-btn color="primary" class="mr-3" @click="calibrateDialog = true" :loading="loadingCalibrate" :disabled="is_printing">Calibrate</v-btn>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-dialog v-model="saveDialog" persistent max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Mesh Profile</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field label="Name" required v-model="newName"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="waring darken-1" text @click="saveDialog = false">abort</v-btn>
                    <v-btn color="blue darken-1" text @click="saveProfile">save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="calibrateDialog" persistent max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Bed Mesh Calibrate</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12">
                                <p>Do you really want to start the bed calibration?</p>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="waring darken-1" text @click="calibrateDialog = false">abort</v-btn>
                    <v-btn color="blue darken-1" text @click="calibrateMesh">calibrate</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="removeDialog" persistent max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Bed Mesh Profile</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12">
                                <p>Do you really want to delete the profile "{{ this.profile }}"?</p>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="waring darken-1" text @click="removeDialog = false">abort</v-btn>
                    <v-btn color="blue darken-1" text @click="removeProfile">remove</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
    import {mapGetters, mapState} from 'vuex';
    import { Plotly } from 'vue-plotly'

    export default {
        components: {
            Plotly
        },
        data () {
            return {
                data:[
                    {
                        x: [],
                        y: [],
                        z: [],
                        type:"surface",
                        intensity: [0, .05, .1],
                        cmin: -0.1,
                        cmax: 0.1,
                        showscale: true,
                        autocolorscale: true,
                        colorbar: {
                            tickfont: {
                                color: '#fff'
                            },
                        }
                    }
                ],
                layout:{
                    showScale: true,
                    plot_bgcolor: 'transparent',
                    paper_bgcolor: 'transparent',
                    margin: {
                        l: 0,
                        r: 100,
                        b: 0,
                        t: 0
                    },
                    scene: {
                        camera: {
                            eye: {
                                x: -1.25,
                                y: -1.25,
                                z: 0.5
                            }
                        },
                        xaxis: {
                            color: '#fff',
                            range: [0,200]
                        },
                        yaxis: {
                            color: '#fff',
                            range: [0,200]
                        },
                        zaxis: {
                            color: '#fff',
                            range: [-1,1]
                        }
                    }
                },
                profiles: [],
                profile: {},
                boolShowBedMesh: false,
                loadingLoad: false,
                disabledLoad: true,
                loadingSave: false,
                disabledSave: true,
                loadingRemove: false,
                disabledRemove: true,
                loadingClear: false,
                disabledClear: true,
                loadingCalibrate: false,
                showMeshType: 'probed',
                saveDialog: false,
                removeDialog: false,
                calibrateDialog: false,
                newName: '',
            }
        },
        computed: {
            ...mapState({
                config: state => state.printer.configfile.config,
                bed_mesh: state => state.printer.bed_mesh,
                loadings: state => state.loadings,
            }),

            ...mapGetters([
                'is_printing',
            ]),
        },
        methods: {
            showBedMesh: function() {
                this.data[0].x = [];
                this.data[0].y = [];
                this.data[0].z = [];

                if (this.bed_mesh && this.bed_mesh.profile_name !== "") {

                    if (this.config.stepper_x !== undefined && this.config.stepper_y !== undefined) {
                        this.layout.scene.xaxis.range = [this.config.stepper_x.position_min, this.config.stepper_x.position_max];
                        this.layout.scene.yaxis.range= [this.config.stepper_y.position_min, this.config.stepper_y.position_max];
                    } else {
                        this.layout.scene.xaxis.range = [this.bed_mesh.mesh_min[0], this.bed_mesh.mesh_max[0]];
                        this.layout.scene.yaxis.range = [this.bed_mesh.mesh_min[1], this.bed_mesh.mesh_max[1]];
                    }

                    let x_count = 0;
                    let y_count = 0;

                    let min = -1;
                    let max = 1;

                    if (this.showMeshType === 'probed') {
                        x_count = this.bed_mesh.probed_matrix[0].length;
                        y_count = this.bed_mesh.probed_matrix.length;
                        this.data[0].z = this.bed_mesh.probed_matrix;

                        min = Math.min.apply(null, this.bed_mesh.probed_matrix.map(function(row){ return Math.min.apply(Math, row); }));
                        max = Math.max.apply(null, this.bed_mesh.probed_matrix.map(function(row){ return Math.max.apply(Math, row); }));
                    } else if (this.showMeshType === 'mesh') {
                        x_count = this.bed_mesh.mesh_matrix[0].length;
                        y_count = this.bed_mesh.mesh_matrix.length;
                        this.data[0].z = this.bed_mesh.mesh_matrix;

                        min = Math.min.apply(null, this.bed_mesh.mesh_matrix.map(function(row){ return Math.min.apply(Math, row); }));
                        max = Math.max.apply(null, this.bed_mesh.mesh_matrix.map(function(row){ return Math.max.apply(Math, row); }));
                    }

                    let x_step = (this.bed_mesh.mesh_max[0] - this.bed_mesh.mesh_min[0]) / (x_count - 1);
                    for(let i = 0; i < x_count; i++) {
                        this.data[0].x.push(parseFloat(this.bed_mesh.mesh_min[0]) + parseFloat(x_step) * i);
                    }

                    let y_step = (this.bed_mesh.mesh_max[1] - this.bed_mesh.mesh_min[1]) / (y_count - 1);
                    for(let i = 0; i < y_count; i++) {
                        this.data[0].y.push(parseFloat(this.bed_mesh.mesh_min[1]) + parseFloat(y_step) * i);
                    }

                    if (min > -1) min = -1;
                    if (max < 1) max = 1;

                    this.layout.scene.zaxis.range = [min, max];

                    this.boolShowBedMesh = true;
                } else this.boolShowBedMesh = false;

                //this.$refs.heightmap.update();
            },
            switchToProbed: function() {
                this.showMeshType = 'probed';
                this.showBedMesh();
            },
            switchToMesh: function() {
                this.showMeshType = 'mesh';
                this.showBedMesh();
            },
            loadProfile: function() {
                this.$store.commit('setLoading', { name: 'bedMeshLoad' });
                this.$socket.sendObj('printer.gcode.script', { script: "BED_MESH_PROFILE LOAD="+this.profile }, "responseBedMeshLoad");
            },
            saveProfile: function() {
                this.saveDialog = false;
                this.$store.commit('setLoading', { name: 'bedMeshSave' });
                this.$socket.sendObj('printer.gcode.script', { script: "BED_MESH_PROFILE SAVE="+this.newName.toUpperCase() }, "responseBedMeshSave");
            },
            removeProfile: function() {
                this.removeDialog = false;
                this.$store.commit('setLoading', { name: 'bedMeshRemove' });
                this.$socket.sendObj('printer.gcode.script', { script: "BED_MESH_PROFILE REMOVE="+this.profile }, "responseBedMeshRemove");
            },
            clearBedMesh: function() {
                this.$store.commit('setLoading', { name: 'bedMeshClear' });
                this.$socket.sendObj('printer.gcode.script', { script: "BED_MESH_CLEAR" }, "responseBedMeshClear");
            },
            calibrateMesh: function() {
                this.calibrateDialog = false;
                this.$store.commit('setLoading', { name: 'bedMeshCalibrate' });
                this.$socket.sendObj('printer.gcode.script', { script: "BED_MESH_CALIBRATE" }, "responseBedMeshCalibrate");
            }
        },
        created: function() {
            this.profiles = this.$store.getters.getBedMeshProfiles;
        },
        watch: {
            config: function() {
                this.profiles = this.$store.getters.getBedMeshProfiles;
            },
            profile: function() {
                if (this.profile !== "" && this.bed_mesh !== undefined && this.profile === this.bed_mesh.profile_name) {
                    this.disabledLoad = true;
                    this.disabledRemove = false;
                } else if (this.profile !== "") {
                    this.disabledLoad = false;
                    this.disabledRemove = false;
                } else {
                    this.disabledLoad = true;
                    this.disabledRemove = true;
                }
            },
            bed_mesh: {
                deep: false,
                handler(newVal) {
                    if (newVal !== undefined) {
                        this.profiles = this.$store.getters.getBedMeshProfiles;
                        this.showBedMesh();

                        if (this.profile !== "" && this.profile === this.bed_mesh.profile_name) this.disabledLoad = true;
                        else if (this.profile !== "") this.disabledLoad = false;
                        else this.disabledLoad = true;

                        if (
                            this.bed_mesh.probed_matrix.length &&
                            this.bed_mesh.probed_matrix[0].length) {
                            this.disabledClear = false;
                            this.disabledSave = false;
                        } else {
                            this.disabledClear = true;
                            this.disabledSave = true;
                        }
                    }
                }
            },
            loadings: function(loadings) {
                this.loadingLoad = loadings.includes('bedMeshLoad');
                this.loadingClear = loadings.includes('bedMeshClear');
                this.loadingSave = loadings.includes('bedMeshSave');
                this.loadingRemove = loadings.includes('bedMeshRemove');
                this.loadingCalibrate = loadings.includes('bedMeshCalibrate');
            }
        }
    }
</script>