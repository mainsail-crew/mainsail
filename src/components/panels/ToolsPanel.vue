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
            <v-layout wrap class=" text-center">
                <v-flex tag="strong" class="category-header">Heater</v-flex>
                <v-flex tag="strong" class="equal-width">Current</v-flex>
                <v-flex tag="strong" class="equal-width">Target</v-flex>
            </v-layout>
            <div v-for="(heater, index) in heaters" v-bind:key="index" >
                <v-divider class="my-2"></v-divider>
                <v-layout wrap class=" text-center">
                    <v-flex col tag="strong" class="category-header">
                        <a>{{ heater.name }}</a>
                    </v-flex>
                    <v-flex col class="equal-width text-center">
                        <v-layout column>
                            <v-flex tag="strong">{{ heater.temperature.toFixed(1) }}°C</v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex grow class="equal-width pr-2">
                        <toolInput :name="heater.name" ></toolInput>
                    </v-flex>
                </v-layout>
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