<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({})
export default class ExamplePanelPlugin extends Vue {
    @Prop({ type: Object }) panelConfig
    @Prop({ type: Object }) panelStore
    @Prop({ type: Object }) panelSocket

    created() {
        const $store = this.$parent.$store;
        const macros = $store.getters['printer/getMacros']
        console.log($store, macros, this.panelStore, this.panelSocket);


    }

    postStatus() {
        const gcode = "STATUS"
        this.panelStore.dispatch('server/addEvent', {
            message: gcode,
            type: 'command',
        })
        this.panelSocket.emit('printer.gcode.script', { script: gcode }, { loading: 'macro_' + gcode })
    }
}
</script>

<template>
    <div>
        <p>Hello world!</p>
        <button class="v-btn v-btn--is-elevated v-btn--has-bg theme--dark v-size--small" @click="postStatus">Klipper status</button>
    </div>
</template>

<style scoped></style>
