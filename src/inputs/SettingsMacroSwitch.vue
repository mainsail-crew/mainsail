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
                if (this.value) {
                    let index = this.hiddenMacros.indexOf(this.name.toUpperCase());
                    if (index > -1) this.hiddenMacros.splice(index, 1)
                } else this.hiddenMacros.push(this.name.toUpperCase())

                this.$store.dispatch("gui/upload")
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