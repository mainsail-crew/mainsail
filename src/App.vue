<style>
    @import './assets/styles/fonts.css';
    @import './assets/styles/toastr.css';
    @import './assets/styles/page.scss';
    @import './assets/styles/sidebar.scss';
    @import './assets/styles/utils.scss';
    @import './assets/styles/updateManager.scss';
</style>

<template>
    <v-app>
        <vue-headful :title="getTitle" />
        <sidebar></sidebar>
        <topbar></topbar>

        <v-main id="content" v-bind:style="{background:mainBackground,backgroundAttachment:'fixed',backgroundSize: 'cover',backgroundRepeat: 'no-repeat'}">
            <v-scroll-y-transition>
                <v-container fluid id="page-container" class="container px-3 px-sm-6 py-sm-6 mx-auto">
                    <keep-alive>
                        <router-view></router-view>
                    </keep-alive>
                </v-container>
            </v-scroll-y-transition>
        </v-main>

        <select-printer-dialog v-if="remoteMode"></select-printer-dialog>
        <connecting-dialog v-if="!remoteMode"></connecting-dialog>
        <update-dialog></update-dialog>
    </v-app>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'
    import UpdateDialog from "@/components/UpdateDialog"
    import ConnectingDialog from "@/components/ConnectingDialog"
    import SelectPrinterDialog from "@/components/SelectPrinterDialog"
    import Sidebar from "@/components/Sidebar"
    import Topbar from "@/components/Topbar"

export default {
    props: {
        source: String,
    },
    components: {
        ConnectingDialog,
        SelectPrinterDialog,
        UpdateDialog,
        Sidebar,
        Topbar,
    },
    data: () => ({

    }),
    created () {
        this.$vuetify.theme.dark = true
    },
    computed: {
        ...mapState({
            language: state => state.gui.general.language,
            current_file: state => state.printer.print_stats.filename,
            remoteMode: state => state.socket.remoteMode,
        }),
        ...mapGetters([
            'getTitle',
        ]),
        print_percent: {
            get() {
                return this.$store.getters["printer/getPrintPercent"]
            }
        },
        defaultFavicons: {
            get() {
                return this.$store.getters["files/getFavicons"]
            }
        },
        mainBackground: {
            get() {
                return this.$store.getters["files/getMainBackground"]
            }
        },
        customStylesheet: {
            get() {
                return this.$store.getters["files/getCustomStylesheet"]
            }
        },
    },
    methods: {
        drawFavicon(val) {
            let favicon16 = document.querySelector("link[rel*='icon'][sizes='16x16']")
            let favicon32 = document.querySelector("link[rel*='icon'][sizes='32x32']")

            if (val > 0 && val < 100) {
                let faviconSize = 64;

                let canvas = document.createElement('canvas');
                canvas.width = faviconSize;
                canvas.height = faviconSize;
                let context = canvas.getContext('2d');
                let centerX = canvas.width / 2;
                let centerY = canvas.height / 2;
                let radius = 32;
                let percent = (val * 100).toFixed(0);

                /* draw the grey circle */
                context.beginPath();
                context.moveTo(centerX, centerY);
                context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                context.closePath();
                context.fillStyle = "#ddd";
                context.fill();
                context.strokeStyle = "rgba(200, 208, 218, 0.66)";
                context.stroke();

                /* draw the green circle based on percentage */
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
            } else {
                const [favicon16Default, favicon32Default] = this.defaultFavicons
                favicon16.href = favicon16Default
                favicon32.href = favicon32Default
            }
        },
    },
    watch: {
        language(){
            this.$i18n.locale = this.language;
        },
        print_percent() {
            this.drawFavicon(this.print_percent);
        },
        current_file: {
            handler: function(newVal) {
                this.$socket.sendObj("server.files.metadata", { filename: newVal }, "files/getMetadataCurrentFile");
            }
        },
        customStylesheet(newVal) {
            if (newVal !== null) {
                let style = document.getElementById("customStylesheet")
                if (!style) {
                    style = document.createElement('link')
                    style.id = "customStylesheet"
                    style.type = "text/css"
                    style.rel = "stylesheet"
                }

                style.href = newVal
                document.head.appendChild(style)
            } else {
                let style = document.getElementById("customStylesheet")
                if (style) style.remove()
            }
        },
        defaultFavicons() {
            this.drawFavicon(this.print_percent);
        }
    },
}
</script>
