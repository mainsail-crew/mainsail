<template>
    <div>
        <v-row>
            <v-col class="col-sm-12 col-md-6" v-if="is_ready">
                <settings-limits-panel></settings-limits-panel>
            </v-col>
            <v-col class="col-sm-12 col-md-3" v-if="is_ready">
                <settings-endstop-panel></settings-endstop-panel>
                <settings-runout-panel></settings-runout-panel>
            </v-col>
            <v-col class="col-sm-12 col-md-3">
                <settings-system-panel></settings-system-panel>
            </v-col>
        </v-row>
    </div>
</template>
<script>
    import {mapState} from "vuex";

    export default {
        data: () => ({

        }),
        computed: {
            ...mapState({
                is_ready: state => state.socket.is_ready,
            }),
        },
        created() {

        },
        watch: {

        }
    }
</script>