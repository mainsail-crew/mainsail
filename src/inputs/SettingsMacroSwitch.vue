<style>

</style>

<template>
    <v-switch v-model="value" :label="name.toUpperCase()" @change="setValue" hide-details class="mt-0"></v-switch>
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
                let hiddenMacros = this.hiddenMacros

                if (this.value) {
                    let index = hiddenMacros.indexOf(this.name.toUpperCase());
                    if (index > -1) hiddenMacros.splice(index, 1)
                } else hiddenMacros.push(this.name.toUpperCase())

                this.$store.dispatch("gui/setSettings", { dashboard: { hiddenMacros: hiddenMacros }})
            }
        },
        watch: {
            hiddenMacros: function() {
                this.value = !this.hiddenMacros.includes(this.name.toUpperCase())
            }
        },
        created() {
            this.value = !this.hiddenMacros.includes(this.name.toUpperCase())
        }
    }
</script>