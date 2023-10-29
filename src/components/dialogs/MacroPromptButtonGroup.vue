<template>
    <v-row>
        <v-col class="text-center">
            <macro-prompt-button v-for="(button, index) in children" :key="index" :event="button" />
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerStateEventPromptContent } from '@/store/server/types'

@Component({})
export default class MacroPromptButton extends Mixins(BaseMixin) {
    @Prop({ type: Array, required: true }) readonly children!: ServerStateEventPromptContent[]
}
</script>
