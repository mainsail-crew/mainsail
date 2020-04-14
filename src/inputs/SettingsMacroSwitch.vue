<style>
    .settings_macro_switch .v-messages {
        display: none;
    }
</style>

<template>
    <v-switch v-model="value" :label="name.toUpperCase()" @change="setValue" class="settings_macro_switch mt-0"></v-switch>
</template>


<script>
    import { mapState } from 'vuex';

    export default {
        data: function() {
            return {
                value: false
            }
        },
        props: {
            name: String,
        },
        computed: {
            ...mapState({
                hiddenMacros: state => state.gui.dashboard.hiddenMacros
            }),
        },
        methods: {
            setValue() {
                if (this.value) {
                    let index = this.hiddenMacros.indexOf(this.name.toUpperCase());
                    if (index > -1) this.hiddenMacros.splice(index, 1);
                } else this.hiddenMacros.push(this.name.toUpperCase());
            }
        },
        watch: {
            hiddenMacros: function() {
                this.value = !this.hiddenMacros.includes(this.name.toUpperCase());
            }
        },
        created() {
            this.value = !this.hiddenMacros.includes(this.name.toUpperCase());
        }
    }
</script>