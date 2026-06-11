<template>
    <v-navigation-drawer
        :key="navigationStyle"
        v-model="naviDrawer"
        :mini-variant="navigationStyle === 'iconsOnly'"
        :width="navigationWidth"
        :temporary="boolNaviTemp"
        clipped
        app
        :style="sidebarCssVars">
        <template #img>
            <v-img :src="sidebarBackground" height="100%" />
        </template>

        <OverlayScrollbarsComponent class="nav-scrollbar">
            <v-list class="pr-0 pt-0 ml-0">
                <v-list-item
                    v-if="isMobile"
                    router
                    to="/"
                    :class="mobileLogoClass"
                    :style="`height: ${topbarHeight}px`"
                    :ripple="false">
                    <img v-if="sidebarLogo" :src="sidebarLogo" :style="logoCssVars" class="nav-logo" alt="Logo" />
                    <mainsail-logo v-else :color="logoColor" :style="logoCssVars" class="nav-logo" :ripple="false" />
                    <span v-if="navigationStyle !== 'iconsOnly'" class="text-h6 font-weight-regular text-truncate">
                        {{ printerName }}
                    </span>
                </v-list-item>
                <sidebar-item v-for="(category, index) in visibleNaviPoints" :key="index" :item="category" />
            </v-list>
        </OverlayScrollbarsComponent>
        <template #append>
            <v-list-item class="small-list-item mb-2">
                <template #prepend>
                    <span class="menu-item-icon">
                        <about-dialog />
                    </span>
                </template>
            </v-list-item>
        </template>
    </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useDisplay } from 'vuetify'
import { useNavigation } from '@/composables/useNavigation'
import { useTheme } from '@/composables/useTheme'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import TheSelectPrinterDialog from '@/components/TheSelectPrinterDialog.vue'
import AboutDialog from '@/components/dialogs/AboutDialog.vue'
import { navigationWidth, topbarHeight } from '@/store/variables'
import MainsailLogo from '@/components/ui/MainsailLogo.vue'
import SidebarItem from '@/components/ui/SidebarItem.vue'

const store = useStore()
const display = useDisplay()
const { isMobile, visibleNaviPoints } = useNavigation()
const { sidebarLogo, sidebarBgImage, themeObj } = useTheme()
const logoColor = computed(() => store.state.gui.uiSettings.logo)

const navigationStyle = computed(() => store.state.gui.uiSettings.navigationStyle)

const naviDrawer = computed({
    get: (): boolean => store.state.naviDrawer,
    set: (newVal) => store.dispatch('setNaviDrawer', newVal),
})

const sidebarBackground = computed((): string =>
    store.getters['files/getCustomSidebarBackground'] ?? sidebarBgImage.value
)

const boolNaviTemp = computed((): boolean =>
    !isMobile.value && display.mdAndDown.value
)

const sidebarCssVars = computed((): Record<string, string> => {
    if (!boolNaviTemp.value) return {}
    return {
        top: `${topbarHeight}px !important`,
        'padding-bottom': `${topbarHeight}px`,
    }
})

const printerName = computed((): string => {
    if (store.state.gui.general.printername.length) return store.state.gui.general.printername
    return store.state.printer.hostname
})

const logoCssVars = computed(() => {
    if (navigationStyle.value === 'iconsOnly') return {}
    return { 'margin-right': '16px' }
})

const mobileLogoClass = computed(() => ({
    'sidebar-logo': true,
    'no-text-decoration': true,
    'no-background': true,
    'no-border': true,
    'pa-0': navigationStyle.value === 'iconsOnly',
    'justify-center': navigationStyle.value === 'iconsOnly',
}))
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
