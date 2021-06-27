<template>
    <v-row>
        <v-col class="col-6 d-flex justify-center">
            <v-row>
                <v-col class="col-auto d-flex justify-center pr-0" v-if="icon">
                    <v-icon>{{ icon }}</v-icon>
                </v-col>
                <v-col class="col d-flex justify-center flex-column">
                    <span class="settings-row-title">{{ title }}</span>
                    <span v-if="subTitle" class="settings-row-subtitle">{{ subTitle }}</span>
                </v-col>
            </v-row>
        </v-col>
        <v-col class="col-6 d-flex justify-end align-center settings-row-slot">
            <slot></slot>
        </v-col>
    </v-row>
</template>

<script lang="ts">

import {Component, Mixins, Prop} from "vue-property-decorator";
import BaseMixin from "../mixins/base";

@Component
export default class SettingsRow extends Mixins(BaseMixin) {
    @Prop({ required: false, default: '' })
    readonly icon!: string

    @Prop({ required: true })
    readonly title!: string

    @Prop({ required: false })
    readonly subTitle!: string

}
</script>

<style scoped>
    .settings-row-title {
        display: block;
        width: 100%;
        font-weight: bold;
    }

    .settings-row-subtitle {
        display: block;
        font-size: .8em;
        line-height: 1.3;
        margin-top: 3px;
    }

    .settings-row-slot {
        min-height: 64px;
    }
</style>