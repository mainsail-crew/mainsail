<template>
    <v-dialog :value="show" persistent :max-width="400" @keydown.esc="closeDialog">
        <panel
            :title="$t('Heightmap.RenameBedMeshProfile')"
            :icon="mdiGrid"
            card-class="heightmap-rename-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-text-field
                    ref="input"
                    v-model="newName"
                    :label="$t('Heightmap.Name')"
                    required
                    :rules="rules"
                    @update:error="
                        (newVal) => {
                            isInvalidName = newVal
                        }
                    "
                    @keyup.enter="renameProfile" />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closeDialog">{{ $t('Heightmap.Abort') }}</v-btn>
                <v-btn :disabled="isInvalidName" color="primary" text @click="renameProfile">
                    {{ $t('Heightmap.Rename') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>
<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiCloseThick, mdiGrid } from '@mdi/js'

@Component
export default class HeightmapRenameProfileDialog extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiGrid = mdiGrid

    @Prop({ type: Boolean, required: true }) show!: boolean
    @Prop({ type: String, required: true }) name!: string

    $refs!: {
        input: HTMLInputElement
    }

    isInvalidName = false
    newName = ''

    rules = [
        (value: string) => !!value || this.$t('Heightmap.InvalidNameEmpty'),
        (value: string) => value !== 'default' || this.$t('Heightmap.InvalidNameReserved'),
        (value: string) => !this.profileNames.includes(value) || this.$t('Heightmap.InvalidNameAlreadyExists'),
        // eslint-disable-next-line no-control-regex
        (value: string) => value === value.replace(/[^\x00-\x7F]/g, '') || this.$t('Heightmap.InvalidNameAscii'),
    ]

    get profileNames() {
        return Object.keys(this.$store.state.printer.bed_mesh?.profiles ?? {})
    }

    renameProfile() {
        const gcode = `BED_MESH_PROFILE SAVE="${this.newName}"\nBED_MESH_PROFILE REMOVE="${this.name}"`

        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'bedMeshRename' })

        this.closeDialog()
    }

    closeDialog() {
        this.$emit('close')
    }

    @Watch('show')
    showChanged() {
        if (this.show) {
            this.newName = this.name

            this.$nextTick(() => {
                setTimeout(() => {
                    this.$refs.input?.focus()
                }, 100)
            })
        }
    }
}
</script>
