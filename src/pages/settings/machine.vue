<template>
    <div>
        <v-row>
            <v-col class="col-sm-12 col-md-6">
                <settings-limits-panel></settings-limits-panel>
            </v-col>
            <v-col class="col-sm-12 col-md-3">
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
    export default {

    }
</script>