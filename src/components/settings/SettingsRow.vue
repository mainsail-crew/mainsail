<template>
    <v-row>
        <v-col :class="firstColClasses">
            <v-row class="d-flex flex-row">
                <v-col v-if="loading" class="col-auto d-flex justify-center align-center pr-0">
                    <v-progress-circular indeterminate color="primary" :size="24" />
                </v-col>
                <v-col v-else-if="icon" class="col-auto d-flex justify-center align-center pr-0">
                    <v-icon>{{ icon }}</v-icon>
                </v-col>
                <v-col class="col d-flex justify-center flex-column">
                    <span class="settings-row-title">{{ title }}</span>
                    <span v-if="subTitle" class="settings-row-subtitle">{{ subTitle }}</span>
                </v-col>
            </v-row>
        </v-col>
        <v-col :class="secondColClasses">
            <slot />
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import { TranslateResult } from 'vue-i18n'

@Component
export default class SettingsRow extends Mixins(BaseMixin) {
    @Prop({ required: false, default: false })
    declare readonly loading: boolean

    @Prop({ required: false, default: '' })
    declare readonly icon: string

    @Prop({ required: true })
    declare readonly title: string | TranslateResult

    @Prop({ required: false })
    declare readonly subTitle: string | TranslateResult

    @Prop({ required: false, default: false })
    declare readonly dynamicSlotWidth: boolean

    @Prop({ required: false, default: false })
    declare readonly mobileSecondRow: boolean

    get firstColClasses() {
        const defaultClasses = ' d-flex justify-center'

        if (this.dynamicSlotWidth) return 'col' + defaultClasses
        else if (this.mobileSecondRow) return 'col-12 col-md-6' + defaultClasses

        return 'col-6' + defaultClasses
    }

    get secondColClasses() {
        const defaultClasses = ' d-flex justify-end align-center settings-row-slot'

        if (this.dynamicSlotWidth) return 'col-auto' + defaultClasses
        else if (this.mobileSecondRow) return 'col-12 col-md-6 pt-0 pt-md-3' + defaultClasses

        return 'col-6' + defaultClasses
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
    font-size: 0.8em;
    line-height: 1.3;
    margin-top: 3px;
}

.settings-row-slot {
    min-height: 64px;
}
</style>
