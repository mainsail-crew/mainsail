<template>
    <v-alert v-if="bypassState" type="warning" class="mt-3" dense text>
        {{ $t('Panels.AfcPanel.BypassActive') }}
    </v-alert>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'

@Component
export default class AfcPanelBypass extends Mixins(BaseMixin, AfcMixin) {
    get bypassState() {
        return this.afc.bypass_state ?? false
    }
}
</script>
