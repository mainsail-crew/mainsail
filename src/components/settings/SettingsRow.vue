<template>
    <v-row>
        <v-col :class="firstColClasses">
            <v-row class="d-flex flex-row">
                <v-col class="col-auto d-flex justify-center align-center pr-0" v-if="loading">
                    <v-progress-circular
                        indeterminate
                        color="primary"
                        :size="24"
                    ></v-progress-circular>
                </v-col>
                <v-col class="col-auto d-flex justify-center align-center pr-0" v-else-if="icon">
                    <v-icon>{{ icon }}</v-icon>
                </v-col>
                <v-col class="col d-flex justify-center flex-column">
                    <span class="settings-row-title">{{ title }}</span>
                    <span v-if="subTitle" class="settings-row-subtitle">{{ subTitle }}</span>
                </v-col>
            </v-row>
        </v-col>
        <v-col :class="secondColClasses">
            <slot></slot>
        </v-col>
    </v-row>
</template>

<script lang="ts">

import {Component, Mixins, Prop} from 'vue-property-decorator'
import BaseMixin from '../mixins/base'

@Component
export default class SettingsRow extends Mixins(BaseMixin) {
    @Prop({ required: false, default: false })
    readonly loading!: boolean

    @Prop({ required: false, default: '' })
    readonly icon!: string

    @Prop({ required: true })
    readonly title!: string

    @Prop({ required: false })
    readonly subTitle!: string

    @Prop({ required: false, default: false })
    readonly dynamicSlotWidth!: boolean

    @Prop({ required: false, default: false })
    readonly mobileSecondRow!: boolean

    get firstColClasses() {
        const defaultClasses = ' d-flex justify-center'

        if (this.dynamicSlotWidth) return 'col'+defaultClasses
        else if (this.mobileSecondRow) return 'col-12 col-md-6'+defaultClasses

        return 'col-6'+defaultClasses
    }

    get secondColClasses() {
        const defaultClasses = ' d-flex justify-end align-center settings-row-slot'

        if (this.dynamicSlotWidth) return 'col-auto'+defaultClasses
        else if (this.mobileSecondRow) return 'col-12 col-md-6 pt-0 pt-md-3'+defaultClasses

        return 'col-6'+defaultClasses
    }

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