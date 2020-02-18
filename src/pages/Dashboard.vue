<template>
    <div>
        <v-flex row wrap>
            <v-flex col xs12 sm6 md4 lg4>
                <status-panel></status-panel>
            </v-flex>

            <v-flex col xs12 sm6 md4 lg4>
                <tools-panel></tools-panel>
            </v-flex>

            <v-flex col v-if="$vuetify.breakpoint.mdAndUp" md3 lg4>
                <!--<temperature-chart></temperature-chart>-->
            </v-flex>
        </v-flex>
        <v-flex row wrap>
            <v-flex col xs12>
            </v-flex>
        </v-flex>
    </div>
</template>

<script>
    export default {
        data: function() {
            return {
                displayToolPosition: true
            }
        },
        computed: {

        }
    }
</script>