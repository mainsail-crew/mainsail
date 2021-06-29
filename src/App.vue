<style scoped>
    @import './assets/styles/fonts.css';
    @import './assets/styles/toastr.css';
    @import './assets/styles/page.scss';
    @import './assets/styles/sidebar.scss';
    @import './assets/styles/utils.scss';
    @import './assets/styles/updateManager.scss';

    #content {
        background-attachment: fixed;
        background-size: cover;
        background-repeat: no-repeat;
    }
</style>

<template>
    <v-app dark>
        <vue-headful :title="title" />
        <the-sidebar></the-sidebar>
        <the-topbar></the-topbar>

        <v-main id="content" v-bind:style="{ background: mainBackground }">
            <v-scroll-y-transition>
                <v-container fluid id="page-container" class="container px-3 px-sm-6 py-sm-6 mx-auto">
                    <keep-alive>
                        <router-view></router-view>
                    </keep-alive>
                </v-container>
            </v-scroll-y-transition>
        </v-main>
        <the-select-printer-dialog v-if="remoteMode"></the-select-printer-dialog>
        <the-connecting-dialog v-else></the-connecting-dialog>
        <the-update-dialog></the-update-dialog>
    </v-app>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import TheSidebar from "@/components/TheSidebar.vue";
import BaseMixin from "@/components/mixins/base";
import TheTopbar from "@/components/TheTopbar.vue";
import {Mixins,Watch} from "vue-property-decorator";
import TheUpdateDialog from "@/components/TheUpdateDialog.vue";
import TheConnectingDialog from "@/components/TheConnectingDialog.vue";
import TheSelectPrinterDialog from "@/components/TheSelectPrinterDialog.vue";

@Component({
    components: {
        TheSelectPrinterDialog,
        TheConnectingDialog,
        TheUpdateDialog,
        TheTopbar,
        TheSidebar,
    }
})
export default class App extends Mixins(BaseMixin) {

    get title(): string {
        return this.$store.getters["getTitle"]
    }

    get remoteMode() {
        return this.$store.state.socket.remoteMode ?? false
    }

    get mainBackground() {
        return this.$store.getters["files/getMainBackground"]
    }

    get customStylesheet () {
        return this.$store.getters["files/getCustomStylesheet"]
    }

    get language () {
        return this.$store.state.gui.general.language
    }

    get current_file () {
        return this.$store.state.printer.print_stats?.filename ?? ""
    }

    get primaryColor () {
        return this.$store.state.gui.theme.primary
    }

    @Watch('language')
    languageChanged(newVal: string) {
        this.$i18n.locale = newVal;
    }

    @Watch('customStylesheet')
    customStylesheetChanged(newVal: string | null) {
        const style = document.getElementById("customStylesheet")
        if (newVal !== null && style === null) {
            const newStyle = document.createElement('link')
            newStyle.id = "customStylesheet"
            newStyle.type = "text/css"
            newStyle.rel = "stylesheet"
            newStyle.href = newVal
            document.head.appendChild(newStyle)
        } else if (newVal !== null && style) {
            style.setAttribute('href', newVal)
        } else if (style) style.remove()
    }

    @Watch('current_file')
    current_fileChanged(newVal: string) {
        this.$socket.emit("server.files.metadata", { filename: newVal }, "files/getMetadataCurrentFile");
    }

    @Watch('primaryColor')
    primaryColorChanged(newVal: string) {
        this.$nextTick(() => {
            this.$vuetify.theme.currentTheme.primary = newVal
        })
    }
}

/*export default Vue.extend({
    computed: {
        print_percent () {
            return this.$store.getters["printer/getPrintPercent"]
        },
        defaultFavicons () {
            return this.$store.getters["files/getFavicons"]
        },
    },
    methods: {
        /!*drawFavicon(val: number) {
            const favicon16 = document.querySelector("link[rel*='icon'][sizes='16x16']")
            const favicon32 = document.querySelector("link[rel*='icon'][sizes='32x32']")

            if (val > 0 && val < 100 && favicon16 && favicon32) {
                let faviconSize = 64;

                let canvas = document.createElement('canvas');
                canvas.width = faviconSize;
                canvas.height = faviconSize;
                const context = canvas.getContext('2d');
                let centerX = canvas.width / 2;
                let centerY = canvas.height / 2;
                let radius = 32;
                let percent = (val * 100).toFixed(0);

                /!* draw the grey circle *!/
                if (context) {
                    context.beginPath();
                    context.moveTo(centerX, centerY);
                    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                    context.closePath();
                    context.fillStyle = "#ddd";
                    context.fill();
                    context.strokeStyle = "rgba(200, 208, 218, 0.66)";
                    context.stroke();

                    /!* draw the green circle based on percentage *!/
                    let startAngle = 1.5 * Math.PI;
                    let endAngle = 0;
                    let unitValue = (Math.PI - 0.5 * Math.PI) / 25;
                    if (percent >= 0 && percent <= 25) endAngle = startAngle + (percent * unitValue);
                    else if (percent > 25 && percent <= 50) endAngle = startAngle + (percent * unitValue);
                    else if (percent > 50 && percent <= 75) endAngle = startAngle + (percent * unitValue);
                    else if (percent > 75 && percent <= 100) endAngle = startAngle + (percent * unitValue);

                    context.beginPath();
                    context.moveTo(centerX, centerY);
                    context.arc(centerX, centerY, radius, startAngle, endAngle, false);
                    context.closePath();
                    context.fillStyle = "#e41313";
                    context.fill();

                    favicon16.href = canvas.toDataURL('image/png')
                    favicon32.href = canvas.toDataURL('image/png')
                }
            } else if (favicon16 && favicon32) {
                const [favicon16Default, favicon32Default] = this.defaultFavicons
                favicon16.href = favicon16Default
                favicon32.href = favicon32Default
            }
        },*!/
    },
    watch: {
        /!*print_percent() {
            this.drawFavicon(this.print_percent);
        },
        defaultFavicons() {
            this.drawFavicon(this.print_percent);
        }*!/
    },
})*/
</script>
