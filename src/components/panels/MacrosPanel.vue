<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>fa-thermometer-three-quarters</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Macros</v-list-item-title>
                <v-list-item-subtitle>
                    {{ getMacros.length }} Macros
                </v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-card-text class="px-0 pt-0 pb-2 content text-center">
            <div v-for="(macro, index) in getMacros" v-bind:key="index+99" style="display: inline-block;" class="mx-1 my-1">
                <v-btn color="primary" class="ml-3" @click="doSend(macro.name)">{{ macro.name }}</v-btn>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
    import {mapGetters} from 'vuex'

    export default {
        components: {

        },
        data: function() {
            return {

            }
        },
        computed: {
            ...mapGetters([
                'getMacros',
            ]),
        },
        methods: {
            doSend(gcode) {
                this.$socket.sendObj('post_printer_gcode', { script: gcode }, "sendGcode");
            },
        },

    }
</script>