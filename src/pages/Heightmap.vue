<style>

</style>

<template>
    <div>
        <v-row>
            <v-col class="col-xl-8">
                <v-card>
                    <v-list-item>
                        <v-list-item-avatar color="grey"><v-icon dark>mdi-grid</v-icon></v-list-item-avatar>
                        <v-list-item-content>
                            <v-list-item-title class="headline">Heightmap</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-divider class="my-2"></v-divider>
                    <v-card-text class="px-0 py-0 content">
                        <Plotly ref="heightmap" :data="data" :layout="layout" :display-mode-bar="false"></Plotly>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col class="col-xl-4">
                <v-card>
                    <v-list-item>
                        <v-list-item-avatar color="grey"><v-icon dark>mdi-cogs</v-icon></v-list-item-avatar>
                        <v-list-item-content>
                            <v-list-item-title class="headline">Profile</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-divider class="my-2"></v-divider>
                    <v-card-text>
                        <v-select
                            :items="profiles"
                            v-model="profile"
                            item-text="name"
                            item-value="data"
                            label="Profil"
                            outlined
                        ></v-select>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>
<script>
    import { mapState } from 'vuex';
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
                                z: 0.25
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
                profile: {}
            }
        },
        computed: {
            ...mapState({
                config: state => state.config,
            }),
        },
        methods: {

        },
        watch: {
            config: function() {
                this.profiles = this.$store.getters.getBedMeshProfiles;

                if (this.config.stepper_x !== undefined) this.layout.scene.xaxis.range = [this.config.stepper_x.position_min, this.config.stepper_x.position_max];
                if (this.config.stepper_y !== undefined) this.layout.scene.yaxis.range= [this.config.stepper_y.position_min, this.config.stepper_y.position_max];

                this.$refs.heightmap.update();
            },
            profile: function() {
                this.data[0].x = [];
                let x_step = (this.profile.max_x - this.profile.min_x) / this.profile.x_count;
                for(let i = 0; i < this.profile.x_count; i++) {
                    this.data[0].x.push(parseFloat(this.profile.min_x) + parseFloat(x_step) * i);
                }

                this.data[0].y = [];
                let y_step = (this.profile.max_y - this.profile.min_y) / this.profile.y_count;
                for(let i = 0; i < this.profile.y_count; i++) {
                    this.data[0].y.push(parseFloat(this.profile.min_y) + parseFloat(y_step) * i);
                }

                this.data[0].z = [];
                let rows = this.profile.points.split('\n')
                rows.forEach((row) => {
                    if (row !== "") {
                        let tmp = [];
                        let cols = row.split(', ');
                        cols.forEach((col) => {
                            tmp.push(parseFloat(col));
                        });

                        this.data[0].z.push(tmp);
                    }
                });

                //this.$refs.heightmap.plot();
                window.console.log(this.$refs);
            }
        }
    }
</script>