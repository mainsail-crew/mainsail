<style>

</style>

<template>
    <div>
        <v-row>
            <v-col class="col-12 col-md-8">
                <v-card>
                    <v-toolbar flat dense>
                        <v-toolbar-title>
                            <span class="subheading">
                                <v-icon left>mdi-grid</v-icon>
                                Heightmap
                            </span>
                            <v-btn
                                text
                                color="primary"
                                class="ml-1 d-none d-sm-inline-flex"
                                @click="openRenameProfile()">{{ this.bed_mesh && this.bed_mesh.profile_name ? this.bed_mesh.profile_name : "" }}</v-btn>
                        </v-toolbar-title>
                        <v-spacer class=""></v-spacer>
                        <v-btn
                            text
                            color="primary"
                            class=" d-sm-none"
                            @click="openRenameProfile()">{{ this.bed_mesh && this.bed_mesh.profile_name ? this.bed_mesh.profile_name : "" }}</v-btn>
                        <v-item-group class="v-btn-toggle d-none d-sm-flex" name="controllers">
                            <v-btn small class="px-2 minwidth-0" color="primary" @click="homePrinter" :loading="loadings.includes('homeAll')" title="Home All"><v-icon small>mdi-home</v-icon></v-btn>
                            <v-btn small class="px-2 minwidth-0" color="primary" @click="clearBedMesh" :loading="loadings.includes('bedMeshClear')" v-if="this.bed_mesh && this.bed_mesh.profile_name" title="Clear bed mesh">Clear</v-btn>
                            <v-btn small class="px-2 minwidth-0" color="primary" @click="calibrateDialog = true" :loading="loadings.includes('bedMeshCalibrate')" :disabled="is_printing" title="Calibrate new bed mesh">Calibrate</v-btn>
                        </v-item-group>
                    </v-toolbar>
                    <v-card-text class="d-sm-none text-center pb-0">
                        <v-item-group class="v-btn-toggle" name="controllers">
                            <v-btn small class="px-2 minwidth-0" color="primary" @click="homePrinter" :loading="loadings.includes('homeAll')" title="Home All"><v-icon small>mdi-home</v-icon></v-btn>
                            <v-btn small class="px-2 minwidth-0" color="primary" @click="clearBedMesh" :loading="loadings.includes('bedMeshClear')" v-if="this.bed_mesh && this.bed_mesh.profile_name" title="Clear bed mesh">Clear</v-btn>
                            <v-btn small class="px-2 minwidth-0" color="primary" @click="calibrateDialog = true" :loading="loadings.includes('bedMeshCalibrate')" :disabled="is_printing" title="Calibrate new bed mesh">Calibrate</v-btn>
                        </v-item-group>
                    </v-card-text>
                    <v-card-text v-if="!(this.bed_mesh && this.bed_mesh.profile_name)">
                        No bed_mesh has been loaded yet.
                    </v-card-text>
                    <v-card-text class="px-0 py-0 content" v-if="this.bed_mesh && this.bed_mesh.profile_name">
                        <v-container class="px-0 py-0">
                            <v-row>
                                <v-col class="pb-0 pt-5">
                                    <Plotly ref="heightmap" :data="data" :layout="layout" :display-mode-bar="false"></Plotly>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                    <v-card-actions v-if="this.bed_mesh && this.bed_mesh.profile_name" class="py-0">
                        <v-spacer></v-spacer>
                        <v-btn text :color="(this.showMeshType === 'probed' ? 'primary accent-4' : 'grey lighten-2')" @click="switchToProbed">Probed</v-btn>
                        <v-btn text :color="(this.showMeshType === 'mesh' ? 'primary accent-4' : 'grey lighten-2')" @click="switchToMesh">Mesh</v-btn>
                        <v-spacer></v-spacer>
                        <v-switch class="mr-3" v-model="colorbarType" label="Scale"></v-switch>
                    </v-card-actions>
                </v-card>
                <v-card>
                    <v-toolbar flat dense>
                        <v-toolbar-title>
                            <span class="subheading">
                                <v-icon left>mdi-grid</v-icon>
                                Heightmap
                            </span>
                            <v-btn
                                text
                                color="primary"
                                class="ml-1 d-none d-sm-inline-flex"
                                @click="openRenameProfile()">{{ this.bed_mesh && this.bed_mesh.profile_name ? this.bed_mesh.profile_name : "" }}</v-btn>
                        </v-toolbar-title>
                        <v-spacer class=""></v-spacer>
                        <v-btn
                            text
                            color="primary"
                            class=" d-sm-none"
                            @click="openRenameProfile()">{{ this.bed_mesh && this.bed_mesh.profile_name ? this.bed_mesh.profile_name : "" }}</v-btn>
                        <v-item-group class="v-btn-toggle d-none d-sm-flex" name="controllers">
                            <v-btn small class="px-2 minwidth-0" color="primary" @click="homePrinter" :loading="loadings.includes('homeAll')" title="Home All"><v-icon small>mdi-home</v-icon></v-btn>
                            <v-btn small class="px-2 minwidth-0" color="primary" @click="clearBedMesh" :loading="loadings.includes('bedMeshClear')" v-if="this.bed_mesh && this.bed_mesh.profile_name" title="Clear bed mesh">Clear</v-btn>
                            <v-btn small class="px-2 minwidth-0" color="primary" @click="calibrateDialog = true" :loading="loadings.includes('bedMeshCalibrate')" :disabled="is_printing" title="Calibrate new bed mesh">Calibrate</v-btn>
                        </v-item-group>
                    </v-toolbar>
                    <v-card-text class="d-sm-none text-center pb-0">
                        <v-item-group class="v-btn-toggle" name="controllers">
                            <v-btn small class="px-2 minwidth-0" color="primary" @click="homePrinter" :loading="loadings.includes('homeAll')" title="Home All"><v-icon small>mdi-home</v-icon></v-btn>
                            <v-btn small class="px-2 minwidth-0" color="primary" @click="clearBedMesh" :loading="loadings.includes('bedMeshClear')" v-if="this.bed_mesh && this.bed_mesh.profile_name" title="Clear bed mesh">Clear</v-btn>
                            <v-btn small class="px-2 minwidth-0" color="primary" @click="calibrateDialog = true" :loading="loadings.includes('bedMeshCalibrate')" :disabled="is_printing" title="Calibrate new bed mesh">Calibrate</v-btn>
                        </v-item-group>
                    </v-card-text>
                    <v-card-text v-if="!(this.bed_mesh && this.bed_mesh.profile_name)">
                        No bed_mesh has been loaded yet.
                    </v-card-text>
                    <v-card-text class="px-0 py-0 content" v-if="this.bed_mesh && this.bed_mesh.profile_name">
                        <v-container class="px-0 py-0">
                            <v-row>
                                <v-col class="pb-0 pt-5">
                                    <div id="heightmap" style="height: 400px; width: 100%;"></div>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                    <v-card-actions v-if="this.bed_mesh && this.bed_mesh.profile_name" class="py-0">
                        <v-spacer></v-spacer>
                        <v-btn text :color="(this.showMeshType === 'probed' ? 'primary accent-4' : 'grey lighten-2')" @click="switchToProbed">Probed</v-btn>
                        <v-btn text :color="(this.showMeshType === 'mesh' ? 'primary accent-4' : 'grey lighten-2')" @click="switchToMesh">Mesh</v-btn>
                        <v-spacer></v-spacer>
                        <v-switch class="mr-3" v-model="colorbarType" label="Scale"></v-switch>
                    </v-card-actions>
                </v-card>
            </v-col>
            <v-col class="col-12 col-md-4">
                <v-card>
                    <v-toolbar flat dense>
                        <v-toolbar-title>
                            <span class="subheading"><v-icon left>mdi-stack-overflow</v-icon>Profile</span>
                        </v-toolbar-title>
                    </v-toolbar>
                    <v-card-text class="py-0 px-0">
                        <v-simple-table>
                            <template v-slot:default>
                                <tbody>
                                <tr v-for="(profile, index) in profiles" :key="index" >
                                    <td>{{ profile.name }}<small class="ml-2" v-if="'deleted' in profile.data">(deleted)</small></td>
                                    <td class="text-right">
                                        <v-btn-toggle dense no-gutters>
                                            <v-btn class="btnMinWidthAuto" @click="loadProfile(profile.name)" :loading="loadings.includes('bedMeshLoad_'+profile.name)" :disabled="('profile_name' in bed_mesh && bed_mesh.profile_name === profile.name) || 'deleted' in profile.data" ><v-icon small>mdi-view-grid-plus</v-icon></v-btn>
                                            <v-btn class="btnMinWidthAuto" @click="openRemoveProfile(profile.name)" :loading="loadings.includes('bedMeshRemove_'+profile.name)" :disabled="'deleted' in profile.data" ><v-icon small>mdi-delete</v-icon></v-btn>
                                        </v-btn-toggle>
                                    </td>
                                </tr>
                                </tbody>
                            </template>
                        </v-simple-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-dialog v-model="renameDialog" persistent max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Rename Bed Mesh Profile</span>
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
                    <v-btn color="waring darken-1" text @click="renameDialog = false">abort</v-btn>
                    <v-btn color="blue darken-1" text @click="renameProfile">rename</v-btn>
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
                    <span class="headline">Delete Bed Mesh Profile</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12">
                                <p>Do you really want to delete the profile "{{ removeDialogProfile }}"?</p>
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
    import {mapGetters, mapState} from 'vuex'
    import { Plotly } from 'vue-plotly'
    import * as echarts from "echarts"
    import 'echarts-gl'

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
                        r: 120,
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
                            range: [-0.5,0.5]
                        }
                    }
                },
                showMeshType: 'probed',
                renameDialog: false,
                removeDialogProfile: '',
                removeDialog: false,
                calibrateDialog: false,
                newName: '',
                colorbarType: false,
                chart : null,
                chartOptions: {
                    animation: false,
                    visualMap: {
                        show: false,
                        dimension: 2,
                        min: -1,
                        max: 1,
                        inRange: {
                            color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
                        }
                    },
                    xAxis3D: {
                        type: 'value'
                    },
                    yAxis3D: {
                        type: 'value'
                    },
                    zAxis3D: {
                        type: 'value'
                    },
                    grid3D: {
                        viewControl: {
                            // projection: 'orthographic'
                        }
                    },
                    series: [{
                        type: 'surface',
                        wireframe: {
                            //show: false
                        },
                        data: []
                    }]
                },
            }
        },
        computed: {
            ...mapState({
                config: state => state.printer.configfile.settings,
                loadings: state => state.socket.loadings,
            }),

            ...mapGetters([
                'is_printing',
            ]),
            bed_mesh: {
                get() {
                    return this.$store.state.printer.bed_mesh || null
                },
                set() {}
            },
            profileName: {
                get() {
                    return this.$store.getters["printer/getBedMeshProfileName"]
                }
            },
            profiles: {
                get() {
                    return this.$store.getters["printer/getBedMeshProfiles"]
                },
                set() {

                }
            }
        },
        methods: {
            createChart() {
                if (document.getElementById("heightmap") && this.chart === null) {
                    this.chart = echarts.init(document.getElementById("heightmap") )
                } else setTimeout(() => {
                    this.createChart()
                }, 500)
            },
            showBedMesh: function() {
                const heightmapData = []
                this.data[0].x = [];
                this.data[0].y = [];
                this.data[0].z = [];

                if (this.bed_mesh && this.bed_mesh.profile_name !== "" && this.chart) {
                    const meshXmin = this.bed_mesh.mesh_min[0]
                    const meshXmax = this.bed_mesh.mesh_max[0]
                    const meshYmin = this.bed_mesh.mesh_min[1]
                    const meshYmax = this.bed_mesh.mesh_max[1]
                    window.console.log(this.config)

                    if ('stepper_x' in this.config && 'stepper_y' in this.config) {
                        this.chartOptions.xAxis3D.min = this.config.stepper_x.position_min
                        this.chartOptions.xAxis3D.max = this.config.stepper_x.position_max
                        this.chartOptions.yAxis3D.min = this.config.stepper_y.position_min
                        this.chartOptions.yAxis3D.max = this.config.stepper_y.position_max

                        this.layout.scene.xaxis.range = [this.config.stepper_x.position_min, this.config.stepper_x.position_max];
                        this.layout.scene.yaxis.range= [this.config.stepper_y.position_min, this.config.stepper_y.position_max];
                    } else {
                        this.chartOptions.xAxis3D.min = meshXmin
                        this.chartOptions.xAxis3D.max = meshXmax
                        this.chartOptions.yAxis3D.min = meshYmin
                        this.chartOptions.yAxis3D.max = meshYmax

                        this.layout.scene.xaxis.range = [this.bed_mesh.mesh_min[0], this.bed_mesh.mesh_max[0]];
                        this.layout.scene.yaxis.range = [this.bed_mesh.mesh_min[1], this.bed_mesh.mesh_max[1]];
                    }

                    const meshData = this.showMeshType === "probed" ? this.bed_mesh.probed_matrix : this.bed_mesh.mesh_matrix
                    const x_count = meshData[0].length;
                    const y_count = meshData.length;
                    this.data[0].z = meshData;

                    let min = Math.min.apply(null, meshData.map(function(row){ return Math.min.apply(Math, row); }));
                    let max = Math.max.apply(null, meshData.map(function(row){ return Math.max.apply(Math, row); }));

                    let x_step = (this.bed_mesh.mesh_max[0] - this.bed_mesh.mesh_min[0]) / (x_count - 1);
                    for(let i = 0; i < x_count; i++) {
                        this.data[0].x.push(parseFloat(this.bed_mesh.mesh_min[0]) + parseFloat(x_step) * i);
                    }

                    let y_step = (this.bed_mesh.mesh_max[1] - this.bed_mesh.mesh_min[1]) / (y_count - 1);
                    for(let i = 0; i < y_count; i++) {
                        this.data[0].y.push(parseFloat(this.bed_mesh.mesh_min[1]) + parseFloat(y_step) * i);
                    }

                    for (let y = 0; y < y_count; y++) {
                        for (let x = 0; x < x_count; x++) {
                            heightmapData.push([
                                Math.round(meshXmin + (meshXmax-meshXmin) / (x_count - 1) * x * 1000) /  1000,
                                Math.round(meshYmin + (meshYmax-meshYmin) / (y_count - 1) * y * 1000) /  1000,
                                meshData[y][x]
                            ])
                        }
                    }

                    if(this.colorbarType) {
                        this.data[0].cmin = min
                        this.data[0].cmax = max
                        this.data[0].autocolorscale = false
                    } else {
                        this.data[0].cmin = -0.1
                        this.data[0].cmax = 0.1
                        this.data[0].autocolorscale = true
                    }

                    if (min > -0.5) min = -0.5
                    if (max < 0.5) max = 0.5

                    this.layout.scene.zaxis.range = [min, max]
                    this.chartOptions.zAxis3D.min = min
                    this.chartOptions.zAxis3D.max = max

                    this.chartOptions.series[0].data = heightmapData
                    window.console.log(this.chartOptions)
                    this.chart.setOption(this.chartOptions)
                }

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
            loadProfile: function(name) {
                this.$store.commit('socket/addLoading', { name: 'bedMeshLoad_'+name })
                this.$store.commit('server/addEvent', { message: "BED_MESH_PROFILE LOAD="+name, type: 'command' })
                this.$socket.sendObj('printer.gcode.script', { script: "BED_MESH_PROFILE LOAD="+name }, "socket/removeLoading", { name: 'bedMeshLoad_'+name })
            },
            openRenameProfile: function() {
                this.newName = this.bed_mesh.profile_name || ""
                this.renameDialog = true;
            },
            renameProfile: function() {
                this.renameDialog = false;
                this.$store.commit('socket/addLoading', { name: 'bedMeshRename' })
                this.$store.commit('server/addEvent', { message: "BED_MESH_PROFILE SAVE="+this.newName.toUpperCase(), type: 'command' })
                this.$socket.sendObj('printer.gcode.script', { script: "BED_MESH_PROFILE SAVE="+this.newName.toUpperCase() }, "socket/removeLoading", { name: 'bedMeshRename' })
            },
            openRemoveProfile: function(name) {
                this.newName = name
                this.removeDialog = true;
            },
            removeProfile: function() {
                this.removeDialog = false;
                this.$store.commit('socket/addLoading', { name: 'bedMeshRemove_'+this.newName })
                this.$store.commit('server/addEvent', { message: "BED_MESH_PROFILE REMOVE="+this.newName, type: 'command' })
                this.$socket.sendObj('printer.gcode.script', { script: "BED_MESH_PROFILE REMOVE="+this.newName }, "printer/removeBedMeshProfile", { name: this.newName })
                this.removeDialogProfile = ""
            },
            homePrinter: function() {
                this.$store.commit('socket/addLoading', { name: 'homeAll' })
                this.$store.commit('server/addEvent', { message: "G28", type: 'command' })
                this.$socket.sendObj('printer.gcode.script', { script: "G28" }, "socket/removeLoading", { name: 'homeAll' })
            },
            clearBedMesh: function() {
                this.$store.commit('socket/addLoading', { name: 'bedMeshClear' })
                this.$store.commit('server/addEvent', { message: "BED_MESH_CLEAR", type: 'command' })
                this.$socket.sendObj('printer.gcode.script', { script: "BED_MESH_CLEAR" }, "socket/removeLoading", { name: 'bedMeshClear' })
            },
            calibrateMesh: function() {
                this.calibrateDialog = false;
                this.$store.commit('socket/addLoading', { name: 'bedMeshCalibrate' });
                this.$store.commit('server/addEvent', { message: "BED_MESH_CALIBRATE", type: 'command' })
                this.$socket.sendObj('printer.gcode.script', { script: "BED_MESH_CALIBRATE" }, "socket/removeLoading", { name: 'bedMeshCalibrate' });
            }
        },
        created() {
            window.addEventListener('resize', () => {
                if (this.chart) this.chart.resize()
            })
        },
        mounted() {
            this.createChart()
            this.showBedMesh()
        },
        watch: {
            config: function() {
                this.profiles = this.$store.getters["printer/getBedMeshProfiles"];
            },
            bed_mesh: function(val, newVal) {
                this.bed_mesh = newVal
                this.showBedMesh()
            },
            colorbarType: function(newVal) {
                this.colorbarType = newVal
                this.showBedMesh()
            }
        }
    }
</script>