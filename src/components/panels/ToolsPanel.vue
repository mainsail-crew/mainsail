<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>fa-thermometer-three-quarters</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Heaters</v-list-item-title>
                <v-list-item-subtitle>all heaters</v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-card-text class="px-0 pt-0 pb-2 content">
            <v-layout wrap class=" text-center">
                <v-flex tag="strong" class="category-header">Heater</v-flex>
                <v-flex tag="strong" class="equal-width">Current</v-flex>
                <v-flex tag="strong" class="equal-width">Target</v-flex>
            </v-layout>
            <div v-for="(heater, index) in heaters" v-bind:key="index" >
                <div v-if="data[heater]">
                    <v-divider class="my-2"></v-divider>
                    <v-layout wrap class=" text-center">
                        <v-flex col tag="strong" class="category-header">
                            <a>{{ heater }}</a>
                        </v-flex>
                        <v-flex col class="equal-width text-center">
                            <v-layout column>
                                <v-flex tag="strong">{{ data[heater].temperature.toFixed(2) }}°C</v-flex>
                            </v-layout>
                        </v-flex>
                        <v-flex grow class="equal-width pr-2">
                            <v-text-field
                                    label=""
                                    v-model="data[heater].target"
                                    class=""
                                    @input="setTemp(data[heater].target)"
                                ></v-text-field>
                        </v-flex>
                    </v-layout>
                </div>
            </div>
            <!--<div v-for="(heater, index) in getAllHeaters" v-bind:key="index" >
                <v-divider class="my-2"></v-divider>
                <v-layout wrap class=" text-center">
                    <v-flex col tag="strong" class="category-header">
                        <a>{{ heater.name }}</a>
                    </v-flex>
                    <v-flex col class="equal-width text-center">
                        <v-layout column>
                            <v-flex tag="strong">{{ heater.data !== undefined ? heater.data.temperature.toFixed(1) : '&#45;&#45;' }}°C</v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex grow class="equal-width pr-2">
                        <v-text-field
                            label=""
                            v-model="heater.data.target"
                            class=""
                            @input="setTemp(heater.data.target)">
                        ></v-text-field>
                    </v-flex>
                </v-layout>
            </div>-->
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex'

    export default {
        data: function() {
            return {
                extruderTemps: [250,215,195,0]
            }
        },
        computed: {
            ...mapState({
                data: state => state.printer,
                heaters: state => state.object.heater.available_heaters
            })
        },
        methods: {
            setTemp(value) {
                window.console.log(value);
            }
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

    .probe-span {
        border-radius: 5px;
    }
    .probe-span:not(:last-child) {
        margin-right: 8px;
    }

    .column-target-temp {
    }

    .v-input-target-temp {
        margin: 0;
        padding: 0;
        width: 100px;
        display: inline-block;
    }
</style>