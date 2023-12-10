<template>
    <v-row>
        <v-col>
            <p class="mb-0">{{ text }}</p>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerStateEventPromptContent } from '@/store/server/types'

@Component({})
export default class MacroPromptText extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly event!: ServerStateEventPromptContent

    get text() {
        return this.event.message
    }
}
</script>
