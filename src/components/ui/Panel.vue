<template>
    <v-card class="mb-6">
        <v-toolbar flat dense >
            <v-toolbar-title class="d-flex align-center">
                <v-icon left v-if="icon !== null">{{ icon }}</v-icon>
                <span class="subheading" v-if="title">{{ title }}</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <slot name="buttons"></slot>
        </v-toolbar>
        <slot></slot>
    </v-card>
</template>

<script lang="ts">

import Component from 'vue-class-component'
import {Mixins, Prop} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class Panel extends Mixins(BaseMixin) {
    @Prop({ default: null }) readonly icon!: string | null
    @Prop({ required: true, default: '' }) readonly title!: string
}
</script>