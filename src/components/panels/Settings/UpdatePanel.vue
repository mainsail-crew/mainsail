<template>
    <div>
        <v-card class="mt-6">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-webcam</v-icon>Update</span>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-item-group class="v-btn-toggle" name="controllers">
                    <v-btn small class="px-2 minwidth-0" color="primary" @click="btnSync" title="Pause print"><v-icon small>mdi-lifebuoy</v-icon></v-btn>
                </v-item-group>
            </v-toolbar>
            <v-card-text class="px-0 pt-0 pb-2 content">

            </v-card-text>
        </v-card>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'

    export default {
        components: {

        },
        data: function() {
            return {

            }
        },
        computed: {
            ...mapGetters([

            ])
        },
        methods: {
            btnSync() {

            }
        }
    }
</script>