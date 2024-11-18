<template>
    <v-dialog :value="showDialog" width="400" persistent>
        <panel
            :title="$t('CoolDownDialog.CoolDown')"
            card-class="cool-down-dialog"
            :icon="mdiSnowflake"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closePrompt">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>{{ $t('CoolDownDialog.AreYouSure') }}</v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closePrompt">{{ $t('CoolDownDialog.No') }}</v-btn>
                <v-btn color="primary" text @click="cooldown">{{ $t('CoolDownDialog.Yes') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'

import { mdiCloseThick, mdiSnowflake } from '@mdi/js'

@Component({
    components: { Panel },
})
export default class CoolDownDialog extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiSnowflake = mdiSnowflake

    @Prop({ type: Boolean, default: false }) showDialog!: boolean

    get cooldownGcode(): string {
        return this.$store.getters['gui/presets/getCooldownGcode']
    }

    cooldown(): void {
        this.$store.dispatch('server/addEvent', { message: this.cooldownGcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: this.cooldownGcode })

        this.closePrompt()
    }

    closePrompt() {
        this.$emit('close')
    }
}
</script>

<style scoped></style>
