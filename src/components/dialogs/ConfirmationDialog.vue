<template>
    <v-dialog :value="show" width="400" :fullscreen="isMobile">
        <panel card-class="confirm-top-corner-menu-dialog" :icon="mdiAlert" :title="title" :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="close">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="pt-3">
                <v-row>
                    <v-col>
                        <p class="body-2">{{ text }}</p>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="close">{{ cancelButtonText }}</v-btn>
                <v-btn text color="error" @click="action">{{ actionButtonText }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>
<script lang="ts">
import Component from 'vue-class-component'
import Panel from '@/components/ui/Panel.vue'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiAlert, mdiCloseThick } from '@mdi/js'

@Component({
    components: { Panel },
})
export default class ConfirmationDialog extends Mixins(BaseMixin) {
    mdiAlert = mdiAlert
    mdiCloseThick = mdiCloseThick

    @Prop({ type: Boolean, required: true }) show!: boolean
    @Prop({ type: String, required: true }) title!: string
    @Prop({ type: String, required: true }) text!: string
    @Prop({ type: String, required: true }) actionButtonText!: string
    @Prop({ type: String, required: true }) cancelButtonText!: string

    action() {
        this.$emit('action')
    }

    close() {
        this.$emit('close')
    }
}
</script>
