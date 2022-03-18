<style lang="scss" scoped></style>

<template>
    <v-card flat>
        <v-card-text>G-Codes</v-card-text>
    </v-card>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
@Component({
    components: {},
})
export default class StatusPanelFilesGcodes extends Mixins(BaseMixin) {}
</script>
