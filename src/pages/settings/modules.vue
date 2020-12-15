<template>
    <div>
        <v-row>
            <v-col class="col-12 col-md-6 col-lg-4">
                <settings-module-url></settings-module-url>
            </v-col>
            <v-col class="col-12 col-md-6 col-lg-4">
                <settings-preheat-panel class="mt-0"></settings-preheat-panel>
            </v-col>
            <v-col class="col-12 col-md-6 col-lg-4">
                <settings-scale-panel></settings-scale-panel>
            </v-col>
        </v-row>
    </div>
</template>
<script>
    import { mapState, mapActions } from 'vuex';

    export default {
        computed: {
            ...mapState({
                showDashboardScale: state => state.gui.dashboard.boolScale,
            }),
        },
        methods: {
            ...mapActions([

            ]),
        }
    }
</script>