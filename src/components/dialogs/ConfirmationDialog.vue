<template>
    <v-dialog v-model="showDialog" width="400" :fullscreen="isMobile">
        <panel card-class="confirm-top-corner-menu-dialog" :icon="iconToUse" :title="title" :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="close">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>{{ text }}</v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="close">{{ cancelButtonText }}</v-btn>
                <v-btn text :color="actionButtonColor" @click="action">{{ actionButtonText }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>
<script lang="ts">
import Component from 'vue-class-component'
import Panel from '@/components/ui/Panel.vue'
import { Mixins, Prop, VModel } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiAlert, mdiCloseThick } from '@mdi/js'

@Component({
    components: { Panel },
})
export default class ConfirmationDialog extends Mixins(BaseMixin) {
    mdiAlert = mdiAlert
    mdiCloseThick = mdiCloseThick

    @VModel({ type: Boolean }) showDialog!: boolean
    @Prop({ type: String, required: true }) title!: string
    @Prop({ type: String, required: true }) text!: string
    @Prop({ type: String, required: true }) actionButtonText!: string
    @Prop({ type: String, required: true }) cancelButtonText!: string
    @Prop({ type: String, default: 'error' }) actionButtonColor!: string
    @Prop({ type: String, default: null }) icon!: string | null

    get iconToUse() {
        return this.icon ?? this.mdiAlert
    }

    action() {
        this.$emit('action')
    }

    close() {
        this.showDialog = false
    }
}
</script>
