<template>
    <v-expansion-panel>
        <v-expansion-panel-header>{{ name }}</v-expansion-panel-header>
        <v-expansion-panel-content>
            <v-row v-for="key in filteredKeys" :key="key">
                <v-col cols="4" class="py-1">{{ key }}</v-col>
                <v-col cols="8" class="py-1 text-right">{{ device[key] }}</v-col>
            </v-row>
        </v-expansion-panel-content>
    </v-expansion-panel>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { SerialDevice } from '@/components/dialogs/DevicesDialogSerial.vue'

@Component
export default class DevicesDialogSerialDevice extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) device!: SerialDevice

    get name() {
        return this.device.device_name
    }

    get filteredKeys() {
        const hiddenKeys = ['device_name']
        let keys = Object.keys(this.device)

        // filter hidden keys
        keys = keys.filter((key) => !hiddenKeys.includes(key))

        // filter empty values
        //@ts-ignore
        keys = keys.filter((key) => this.device[key])

        return keys
    }
}
</script>
