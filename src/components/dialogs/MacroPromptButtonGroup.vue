<template>
    <v-row>
        <v-col class="text-center">
            <macro-prompt-button
                v-for="(button, index) in children"
                :key="'prompt_' + groupIndex + '_' + index"
                :event="button" />
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerStateEventPrompt } from '@/store/server/types'

@Component({})
export default class MacroPromptButton extends Mixins(BaseMixin) {
    @Prop({ type: Array, required: true }) readonly children!: ServerStateEventPrompt[]
    @Prop({ type: Number, required: true }) readonly groupIndex!: number
}
</script>
