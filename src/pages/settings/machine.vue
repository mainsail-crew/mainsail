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
            is_ready: false
        }),
        computed: {
            ...mapState({
                klippy_state: state => state.socket.klippy_state,
            }),
        },
        created() {
            this.is_ready = (this.klippy_state === "ready") ? true : false;
        },
        watch: {
            klippy_state() {
                this.is_ready = (this.klippy_state === "ready") ? true : false;
            }
        }
    }
</script>