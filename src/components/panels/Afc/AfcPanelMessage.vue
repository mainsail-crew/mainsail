<template>
    <v-alert v-if="message" :type="type" class="mt-3" dense text>{{ message }}</v-alert>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'

@Component
export default class AfcPanelMessage extends Mixins(BaseMixin, AfcMixin) {
    get type() {
        const type = this.afc.message?.type ?? 'error'
        const possibleTypes = ['info', 'warning', 'success', 'error']

        if (!possibleTypes.includes(type)) {
            window.console.warn(`AfcPanelMessage: Invalid message type "${type}" detected. Defaulting to "error".`)
            return 'error'
        }

        return type
    }

    get message() {
        return this.afc.message?.message ?? ''
    }
}
</script>
