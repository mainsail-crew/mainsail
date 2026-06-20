<template>
    <div class="mmu-unit-footer zindex-4 d-flex flex-row align-center px-2 pb-1">
        <v-icon
            v-if="showFooter && showLogos"
            class="mr-4 flex-grow-0 flex-shrink-0 opacity-70"
            :class="logoClasses"
            :size="logoHeight">
            {{ logo }}
        </v-icon>
        <div v-if="showFooter" class="flex-grow-1 flex-shrink-1 min-width-0 text-caption">
            <div v-if="showName" class="text-truncate">{{ unitDisplayName }}</div>
            <mmu-unit-footer-climate v-if="showDetails && showClimate" :mmu-machine-unit="mmuMachineUnit" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { MmuMachineUnit } from '@/components/mixins/mmu'
import MmuUnitFooterClimate from '@/components/panels/Mmu/MmuUnitFooterClimate.vue'
import {
    mmuIcon3MS,
    mmuIconAngryBeaver,
    mmuIconBoxTurtle,
    mmuIconEmu,
    mmuIconErcf,
    mmuIconHappyHare,
    mmuIconKms,
    mmuIconMmx,
    mmuIconNightOwl,
    mmuIconQuattroBox,
    mmuIconTradrack,
    mmuIconVvd,
    mmuThemeIcons,
} from '@/plugins/mmuIcons'

const squareLogoVendors = ['3MS', 'AngryBeaver', 'EMU', 'ERCF', 'KMS']

@Component({
    components: { MmuUnitFooterClimate },
})
export default class MmuUnitFooter extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: true }) readonly unitIndex!: number
    @Prop({ required: true }) readonly mmuMachineUnit!: MmuMachineUnit
    @Prop({ default: true }) readonly showDetails!: boolean
    @Prop({ default: true }) readonly showFooter!: boolean

    get unitDisplayName(): string {
        const name = this.mmuMachineUnit?.name

        return `#${this.unitIndex + 1} ${name}`
    }

    get showLogos(): boolean {
        return this.$store.state.gui.view.mmu.showLogos ?? true
    }

    get showName(): boolean {
        return this.$store.state.gui.view.mmu.showName ?? true
    }

    get showClimate(): boolean {
        return this.$store.state.gui.view.mmu.showClimate ?? true
    }

    get mmuVendor() {
        return this.mmuMachineUnit?.vendor ?? 'Unknown'
    }

    get logoHeight() {
        if (squareLogoVendors.includes(this.mmuVendor)) return this.spoolWidth - 16

        return this.spoolWidth - 8
    }

    get logoClasses() {
        if (squareLogoVendors.includes(this.mmuVendor)) return ['my-1']

        return []
    }

    get logo() {
        const baseIcon = this.getBaseIcon(this.mmuVendor)
        const themeVariants = mmuThemeIcons[this.mmuVendor]

        if (!themeVariants) return baseIcon

        const isDark = this.$vuetify.theme.dark
        const themeIcon = isDark ? themeVariants.dark : themeVariants.light

        return themeIcon ?? baseIcon
    }

    private getBaseIcon(vendor: string) {
        switch (vendor) {
            case '3MS':
                return mmuIcon3MS

            case 'AngryBeaver':
                return mmuIconAngryBeaver

            case 'BoxTurtle':
                return mmuIconBoxTurtle

            case 'EMU':
                return mmuIconEmu

            case 'ERCF':
                return mmuIconErcf

            case 'KMS':
                return mmuIconKms

            case 'MMX':
                return mmuIconMmx

            case 'NightOwl':
                return mmuIconNightOwl

            case 'QuattroBox':
                return mmuIconQuattroBox

            case 'Tradrack':
                return mmuIconTradrack

            case 'VVD':
                return mmuIconVvd

            default:
                return mmuIconHappyHare
        }
    }
}
</script>

<style scoped>
.mmu-unit-footer {
    background: #2c2c2c;
    border-radius: 0 0 8px 8px;
}

html.theme--light .mmu-unit-footer {
    background: #f0f0f0;
}

.opacity-70 {
    opacity: 0.7;
}

.zindex-4 {
    z-index: 4;
}
</style>
