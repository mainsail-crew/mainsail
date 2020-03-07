<style>
    .heater-row .vertical_align_center {
        margin: auto 0;
    }
</style>

<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>fa-thermometer-three-quarters</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Heaters</v-list-item-title>
                <v-list-item-subtitle>{{ heatersCount }} heaters</v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-card-text class="px-0 pt-0 pb-2 content">
            <v-row class="pl-3 pr-3">
                <v-col class="text-center"><b>Heater</b></v-col>
                <v-col class="text-center"><b>Current</b></v-col>
                <v-col class="text-center"><b>Target</b></v-col>
            </v-row>
            <div v-for="(heater, index) in heaters" v-bind:key="index" >
                <v-divider class="my-2"></v-divider>
                <v-row class="pl-3 pr-3 heater-row">
                    <v-col class="text-center">
                        <b>{{ heater.name }}</b><br />
                        <small>{{ heater.target > 0 ? "active" : "off" }}</small>
                    </v-col>
                    <v-col class="text-center vertical_align_center"><span>{{ heater.temperature.toFixed(1) }}°C</span></v-col>
                    <v-col class="text-center vertical_align_center">
                        <toolInput :name="heater.name" :target="heater.target" ></toolInput>
                    </v-col>
                </v-row>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapGetters } from 'vuex'
    import toolInput from '../../inputs/ToolInput'


    export default {
        components: {
            toolInput
        },
        data: function() {
            return {
                extruderTemps: [250,215,195,0]
            }
        },
        computed: {
            ...mapGetters([
                'heaters',
                'heatersCount'
            ])
        },
        methods: {

        }
    }
</script>

<style scoped>
    .equal-width {
        flex-basis: 0;
    }

    .category-header {
        flex: 0 0 100px;
    }
    a:not(:hover) {
        color: inherit;
    }

    .content span,
    .content strong {
        padding-left: 8px;
        padding-right: 8px;
        white-space: pre-wrap;
    }
</style>