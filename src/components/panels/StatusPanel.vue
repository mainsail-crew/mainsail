<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>fa-info</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Status</v-list-item-title>
                <v-list-item-subtitle>{{ toolhead !== null && 'status' in toolhead ? toolhead.status : "" }}</v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2" ></v-divider>
        <v-card-text class="px-0 pt-0 pb-2 content">
            <v-layout wrap class=" text-center">
                <v-flex col tag="strong" class="category-header">
                    Position
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">X</v-flex>
                        <v-flex tag="span">{{ toolhead !== null && 'position' in toolhead ? toolhead.position[0].toFixed(2) : "--" }}</v-flex>
                    </v-layout>
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">Y</v-flex>
                        <v-flex tag="span">{{ toolhead !== null && 'position' in toolhead ? toolhead.position[1].toFixed(2) : "--" }}</v-flex>
                    </v-layout>
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">Z</v-flex>
                        <v-flex tag="span">{{ toolhead !== null && 'position' in toolhead ? toolhead.position[2].toFixed(2) : "--" }}</v-flex>
                    </v-layout>
                </v-flex>
            </v-layout>

            <!--<v-divider class="my-2" v-if="'position' in toolhead && toolhead.position.length > 3"></v-divider>

            <v-layout wrap class=" text-center" v-if="toolhead && toolhead.position.length > 3">
                <v-flex col tag="strong" class="category-header">
                    Drives
                </v-flex>
                <v-layout v-for="(drive, index) in this.getDrives()" :key="index" v-bind:index="index">
                    <v-flex grow class="equal-width">
                        <v-layout column>
                            <v-flex tag="strong">E{{ index }}</v-flex>
                            <v-flex tag="span">{{ drive.toFixed(2) }}</v-flex>
                        </v-layout>
                    </v-flex>
                </v-layout>
            </v-layout>-->

            <!--<v-divider class="my-2"></v-divider>

            <v-layout wrap class=" text-center">
                <v-flex col tag="strong" class="category-header">
                    Speeds
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">Requested Speed</v-flex>
                        <v-flex tag="span">123 mm/s</v-flex>
                    </v-layout>
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">Top Speed</v-flex>
                        <v-flex tag="span">321 mm/s</v-flex>
                    </v-layout>
                </v-flex>
            </v-layout>-->

            <!--<v-divider class="my-2"></v-divider>

            <v-layout wrap class=" text-center">
                <v-flex tag="strong" class="category-header">
                    Quad Gantry Levelin
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">Z0</v-flex>
                        <v-flex tag="span">1.2um</v-flex>
                    </v-layout>
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">Z1</v-flex>
                        <v-flex tag="span">0.9um</v-flex>
                    </v-layout>
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">Z2</v-flex>
                        <v-flex tag="span">1.0um</v-flex>
                    </v-layout>
                </v-flex>
                <v-flex grow class="equal-width">
                    <v-layout column>
                        <v-flex tag="strong">Z3</v-flex>
                        <v-flex tag="span">1.5um</v-flex>
                    </v-layout>
                </v-flex>
            </v-layout>-->
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        computed: {
            ...mapGetters({
                toolhead: 'toolhead'
            })
        },
        methods: {

        },
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
</style>