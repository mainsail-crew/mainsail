<template>
    <v-row class="mt-0">
        <v-col class="align-content-center text-center pt-0 pb-6 text--disabled">
            {{ $t('Panels.AfcPanel.Empty') }}
        </v-col>
    </v-row>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class AfcPanelUnitLaneEmpty extends Mixins(BaseMixin) {}
</script>
