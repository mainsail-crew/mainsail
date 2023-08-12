<template>
    <v-navigation-drawer
        :key="navigationStyle"
        :value="naviDrawer"
        :src="sidebarBackground"
        :mini-variant="navigationStyle === 'iconsOnly'"
        :width="navigationWidth"
        :temporary="boolNaviTemp"
        clipped
        app
        :style="sidebarCssVars">
        <overlay-scrollbars class="nav-scrollbar">
            <v-list class="pr-0 pt-0 ml-0">
                <v-list-item-group active-class="active-nav-item">
                    <v-list-item
                        v-if="isMobile"
                        router
                        to="/"
                        :class="mobileLogoClass"
                        :style="'height: ' + topbarHeight + 'px'"
                        :ripple="false">
                        <template v-if="sidebarLogo">
                            <img :src="sidebarLogo" :style="logoCssVars" class="nav-logo" alt="Logo" />
                        </template>
                        <template v-else>
                            <mainsail-logo :color="logoColor" :style="logoCssVars" class="nav-logo" :ripple="false" />
                        </template>
                        <template v-if="navigationStyle !== 'iconsOnly'">
                            <span class="text-h6 font-weight-regular text-truncate">{{ printerName }}</span>
                        </template>
                    </v-list-item>
                    <sidebar-item v-for="(category, index) in visibleNaviPoints" :key="index" :item="category" />
                </v-list-item-group>
            </v-list>
        </overlay-scrollbars>
        <template #append>
            <v-list-item class="small-list-item mb-2">
                <v-list-item-icon class="menu-item-icon">
                    <about-dialog />
                </v-list-item-icon>
            </v-list-item>
        </template>
    </v-navigation-drawer>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import TheSelectPrinterDialog from '@/components/TheSelectPrinterDialog.vue'
import AboutDialog from '@/components/dialogs/AboutDialog.vue'
import { navigationWidth, topbarHeight } from '@/store/variables'
import MainsailLogo from '@/components/ui/MainsailLogo.vue'
import SidebarItem from '@/components/ui/SidebarItem.vue'
import NavigationMixin from '@/components/mixins/navigation'

@Component({
    components: {
        SidebarItem,
        TheSelectPrinterDialog,
        AboutDialog,
        MainsailLogo,
    },
})
export default class TheSidebar extends Mixins(NavigationMixin, BaseMixin) {
    navigationWidth = navigationWidth
    topbarHeight = topbarHeight

    get naviDrawer(): boolean {
        return this.$store.state.naviDrawer
    }

    get navigationStyle() {
        return this.$store.state.gui.uiSettings.navigationStyle
    }

    get sidebarBackground(): string {
        return this.$store.getters['files/getSidebarBackground']
    }

    get currentPage(): string {
        return this.$route.fullPath
    }

    get boolNaviTemp(): boolean {
        return !this.isMobile && this.$vuetify.breakpoint.mdAndDown
    }

    get sidebarCssVars(): any {
        if (this.boolNaviTemp) {
            return {
                top: `${topbarHeight}px !important`,
                'padding-bottom': `${topbarHeight}px`,
            }
        }
        return {}
    }

    get sidebarLogo(): string {
        return this.$store.getters['files/getSidebarLogo']
    }

    get logoColor(): string {
        return this.$store.state.gui.uiSettings.logo
    }

    get printerName(): string {
        if (this.$store.state.gui.general.printername.length) return this.$store.state.gui.general.printername

        return this.$store.state.printer.hostname
    }

    get logoCssVars() {
        if (this.navigationStyle !== 'iconsOnly') {
            return {
                'margin-right': '16px',
            }
        }
        return {}
    }

    get mobileLogoClass() {
        const output = ['sidebar-logo', 'no-text-decoration', 'no-background', 'no-border']

        if (this.navigationStyle === 'iconsOnly') {
            output.push('pa-0')
            output.push('justify-center')
        }

        return output
    }
}
</script>

<style scoped>
.no-text-decoration {
    text-decoration: none;
    background-color: transparent;
}

.no-background:before {
    background-color: rgba(255, 255, 255, 0) !important;
}

.no-border {
    border: 0 !important;
}

.nav-logo {
    height: 32px;
}

.menu-item-icon {
    opacity: 0.85;
}

.nav-scrollbar {
    height: 100%;
}
</style>
