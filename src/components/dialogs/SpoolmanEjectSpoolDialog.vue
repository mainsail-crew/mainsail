<template>
    <v-dialog v-model="showDialog" width="400" persistent :fullscreen="isMobile">
        <panel
            :title="$t('Panels.SpoolmanPanel.EjectSpool')"
            :icon="mdiEject"
            card-class="spoolman-eject-spool-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="close">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col>
                        <p class="body-2">{{ $t('Panels.SpoolmanPanel.EjectSpoolQuestion') }}</p>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="close">{{ $t('Panels.SpoolmanPanel.Cancel') }}</v-btn>
                <v-btn color="primary" text @click="removeSpool">
                    {{ $t('Panels.SpoolmanPanel.EjectSpool') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiEject } from '@mdi/js'
@Component({
    components: { Panel },
})
export default class SpoolmanEjectSpoolDialog extends Mixins(BaseMixin) {
    mdiEject = mdiEject
    mdiCloseThick = mdiCloseThick

    @Prop({ required: true }) declare readonly showDialog: boolean

    close() {
        this.$emit('close')
    }

    removeSpool() {
        this.$store.dispatch('server/spoolman/setActiveSpool', null)
        this.close()
    }
}
</script>
