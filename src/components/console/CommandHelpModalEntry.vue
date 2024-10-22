<template>
    <v-list-item class="px-0" :two-line="twoLine">
        <v-list-item-content class="px-0">
            <v-list-item-title class="primary--text font-weight-bold cursor-pointer" @click="onCommand">
                {{ command }}
            </v-list-item-title>
            <v-list-item-subtitle v-if="description" class="text-wrap">{{ description }}</v-list-item-subtitle>
        </v-list-item-content>
    </v-list-item>
</template>

<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import { Mixins, Prop } from 'vue-property-decorator'
import Component from 'vue-class-component'

@Component
export default class CommandHelpModalEntry extends Mixins(BaseMixin) {
    @Prop({ required: true, type: String }) declare command: string

    get commands(): { [key: string]: { help?: string } } {
        return this.$store.state.printer.gcode?.commands ?? {}
    }

    get commandObject(): { help?: string } {
        return this.commands[this.command] ?? {}
    }

    get description(): string | null {
        return this.commandObject.help ?? null
    }

    get twoLine(): boolean {
        return this.description !== null
    }

    onCommand() {
        this.$emit('click-on-command', this.command)
    }
}
</script>
