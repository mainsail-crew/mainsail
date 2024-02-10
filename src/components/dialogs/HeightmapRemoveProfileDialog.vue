<template>
    <v-dialog :value="show" persistent :max-width="400" @keydown.esc="closeDialog">
        <panel
            :title="$t('Heightmap.BedMeshRemove')"
            :icon="mdiGrid"
            card-class="heightmap-remove-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <p class="mb-0">{{ $t('Heightmap.DoYouReallyWantToDelete', { name }) }}</p>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closeDialog">{{ $t('Heightmap.Abort') }}</v-btn>
                <v-btn color="error" text @click="removeProfile">{{ $t('Heightmap.Remove') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiCloseThick, mdiGrid } from '@mdi/js'

@Component
export default class HeightmapRemoveProfileDialog extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiGrid = mdiGrid

    @Prop({ type: Boolean, required: true }) show!: boolean
    @Prop({ type: String, required: true }) name!: string

    removeProfile() {
        const gcode = `BED_MESH_PROFILE REMOVE="${this.name}"`

        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'bedMeshRemove' })

        this.closeDialog()
    }

    closeDialog() {
        this.$emit('close')
    }
}
</script>
