<template>
    <v-dialog :value="show" width="400" @click:outside="closeDialog">
        <panel
            :title="$t('Panels.AfcPanel.AfcSettings')"
            :icon="afcIconLogo"
            card-class="afc-settings-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col class="pb-0">
                        <p>{{ $t('Panels.AfcPanel.InfiniteSpoolDescription', { name: 'test' }) }}</p>
                    </v-col>
                </v-row>
            </v-card-text>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick } from '@mdi/js'
import AfcMixin from '@/components/mixins/afc'
import { afcIconLogo } from '@/plugins/afcIcons'

@Component({
    components: { Panel },
})
export default class AfcSettingsDialog extends Mixins(BaseMixin, AfcMixin) {
    afcIconLogo = afcIconLogo
    mdiCloseThick = mdiCloseThick

    @Prop({ type: Boolean, required: true }) readonly show!: boolean

    doSend(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    closeDialog() {
        this.$emit('close')
    }
}
</script>
