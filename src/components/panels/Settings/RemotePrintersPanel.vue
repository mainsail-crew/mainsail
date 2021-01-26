
<template>
    <div>
        <v-card>
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-printer-3d</v-icon>Remote Printers</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-3">
                <v-container>
                    <v-row v-for="(printer, index) in this['farm/getPrinters']" v-bind:key="index">
                        <v-col class="rounded transition-swing secondary py-2 px-2 mb-6" style="cursor: pointer;">
                            <v-row align="center">
                                <v-col class="col-auto pr-0">
                                    <v-progress-circular
                                        indeterminate
                                        color="primary"
                                        v-if="printer.socket.isConnecting"
                                    ></v-progress-circular>
                                    <v-icon
                                        :color="printer.socket.isConnected ? 'green' : 'red'"
                                        v-if="!printer.socket.isConnecting"
                                    >mdi-{{ printer.socket.isConnected ? 'checkbox-marked-circle' : 'cancel' }}</v-icon>
                                </v-col>
                                <v-col>{{ printer.socket.hostname }}{{ parseInt(printer.socket.port) !== 80 ? ":"+printer.socket.port : "" }}</v-col>
                                <v-col class="col-auto"><v-btn small class="minwidth-0" v-on:click.stop.prevent="editPrinter(index)"><v-icon small>mdi-pencil</v-icon></v-btn></v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-center mt-0">
                            <v-btn @click="dialogAddPrinter.bool = true">add printer</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </v-card>
        <v-dialog v-model="dialogAddPrinter.bool" persistent :width="400">
            <v-card dark>
                <v-toolbar flat dense color="primary">
                    <v-toolbar-title>
                    <span class="subheading">
                        <v-icon class="mdi mdi-connection" left></v-icon>
                        Add Printer
                    </span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn small class="minwidth-0" @click="dialogAddPrinter.bool = false"><v-icon small>mdi-close-thick</v-icon></v-btn>
                </v-toolbar>
                <v-card-text class="pt-3" v-if="remoteMode">
                    <v-container class="px-0 py-0">
                        <v-row>
                            <v-col class="col-8">
                                <v-text-field
                                    v-model="dialogAddPrinter.hostname"
                                    :rules="[
                                        v => !!v || 'Hostname is required',
                                        v => !v.startsWith('http:') || 'invalid hostname/IP',
                                        v => !v.startsWith('https:') || 'invalid hostname/IP',
                                    ]"
                                    label="Hostname/IP"
                                    required
                                ></v-text-field>
                            </v-col>
                            <v-col class="col-4">
                                <v-text-field
                                    v-model="dialogAddPrinter.port"
                                    :rules="[v => !!v || 'Port is required']"
                                    label="Port"
                                    required
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="text-right">
                                <v-btn
                                    color="white"
                                    outlined
                                    class="middle"
                                    @click="addPrinter"
                                >
                                    add printer
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-text class="pt-3" v-if="!remoteMode">
                    <v-container class="px-0 py-0">
                        <v-row>
                            <v-col class="col-12">
                                <v-text-field
                                    v-model="dialogAddPrinter.hostname"
                                    :rules="[
                                        v => !!v || 'Hostname is required',
                                        v => !v.startsWith('http:') || 'invalid hostname/IP',
                                        v => !v.startsWith('https:') || 'invalid hostname/IP',
                                    ]"
                                    label="Hostname/IP"
                                    required
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="col-6">
                                <v-text-field
                                    v-model="dialogAddPrinter.webPort"
                                    :rules="[v => !!v || 'Web-Port is required']"
                                    label="Web-Port"
                                    required
                                ></v-text-field>
                            </v-col>
                            <v-col class="col-6">
                                <v-text-field
                                    v-model="dialogAddPrinter.port"
                                    :rules="[v => !!v || 'API-Port is required']"
                                    label="API-Port"
                                    required
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="text-right">
                                <v-btn
                                    color="white"
                                    outlined
                                    class="middle"
                                    @click="addPrinter"
                                >
                                    add printer
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogEditPrinter.bool" persistent :width="400">
            <v-card dark>
                <v-toolbar flat dense color="primary">
                    <v-toolbar-title>
                    <span class="subheading">
                        <v-icon class="mdi mdi-connection" left></v-icon>
                        Edit Printer
                    </span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn small class="minwidth-0" @click="dialogEditPrinter.bool = false"><v-icon small>mdi-close-thick</v-icon></v-btn>
                </v-toolbar>
                <v-card-text class="pt-3" v-if="remoteMode">
                    <v-container class="px-0 py-0">
                        <v-row>
                            <v-col class="col-8">
                                <v-text-field
                                    v-model="dialogEditPrinter.hostname"
                                    :rules="[
                                        v => !!v || 'Hostname is required',
                                        v => !v.startsWith('http:') || 'invalid hostname/IP',
                                        v => !v.startsWith('https:') || 'invalid hostname/IP',
                                    ]"
                                    label="Hostname/IP"
                                    required
                                ></v-text-field>
                            </v-col>
                            <v-col class="col-4">
                                <v-text-field
                                    v-model="dialogEditPrinter.port"
                                    :rules="[v => !!v || 'Port is required']"
                                    label="Port"
                                    required
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="">
                                <v-btn
                                    color="red"
                                    outlined
                                    class="middle minwidth-0"
                                    @click="delPrinter"
                                >
                                    <v-icon small>mdi-delete</v-icon>
                                </v-btn>
                            </v-col>
                            <v-col class="text-right">
                                <v-btn
                                    color="white"
                                    outlined
                                    class="middle"
                                    @click="updatePrinter"
                                >
                                    update printer
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-text class="pt-3" v-if="!remoteMode">
                    <v-container class="px-0 py-0">
                        <v-row>
                            <v-col class="col-12">
                                <v-text-field
                                    v-model="dialogEditPrinter.hostname"
                                    :rules="[
                                        v => !!v || 'Hostname is required',
                                        v => !v.startsWith('http:') || 'invalid hostname/IP',
                                        v => !v.startsWith('https:') || 'invalid hostname/IP',
                                    ]"
                                    label="Hostname/IP"
                                    required
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="col-6">
                                <v-text-field
                                    v-model="dialogEditPrinter.webPort"
                                    :rules="[v => !!v || 'Web-Port is required']"
                                    label="Web-Port"
                                    required
                                ></v-text-field>
                            </v-col>
                            <v-col class="col-6">
                                <v-text-field
                                    v-model="dialogEditPrinter.port"
                                    :rules="[v => !!v || 'API-Port is required']"
                                    label="API-Port"
                                    required
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="">
                                <v-btn
                                    color="red"
                                    outlined
                                    class="middle minwidth-0"
                                    @click="delPrinter"
                                >
                                    <v-icon small>mdi-delete</v-icon>
                                </v-btn>
                            </v-col>
                            <v-col class="text-right">
                                <v-btn
                                    color="white"
                                    outlined
                                    class="middle"
                                    @click="updatePrinter"
                                >
                                    update printer
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';

    export default {
        components: {

        },
        data: function() {
            return {
                dialogAddPrinter: {
                    bool: false,
                    hostname: "",
                    port: "7125",
                    webPort: "80"
                },
                dialogEditPrinter: {
                    bool: false,
                    hostname: "",
                    port: "",
                    webPort: "80",
                    index: ""
                }
            }
        },
        computed: {
            ...mapState({
                remoteMode: state => state.socket.remoteMode,
                protocol: state => state.socket.protocol,
            }),
            ...mapGetters([
                'farm/getPrinters',
            ])
        },
        methods: {
            addPrinter() {
                this.$store.commit('farm/addPrinter',{
                    hostname: this.dialogAddPrinter.hostname,
                    port: this.dialogAddPrinter.port,
                    webPort: this.dialogAddPrinter.webPort,
                    protocol: this.protocol
                })

                this.dialogAddPrinter.hostname = ""
                this.dialogAddPrinter.port = "7125"
                this.dialogAddPrinter.webPort = "80"
                this.dialogAddPrinter.bool = false

                this.$store.dispatch("farm/savePrinters")
            },
            editPrinter(index) {
                this.dialogEditPrinter.hostname = this["farm/getPrinters"][index].socket.hostname
                this.dialogEditPrinter.port = this["farm/getPrinters"][index].socket.port
                this.dialogEditPrinter.webPort = this["farm/getPrinters"][index].socket.webPort
                this.dialogEditPrinter.index = index
                this.dialogEditPrinter.bool = true
            },
            updatePrinter() {
                this.$store.commit("farm/"+this.dialogEditPrinter.index+"/setSocketData", {
                    hostname: this.dialogEditPrinter.hostname,
                    port: this.dialogEditPrinter.port,
                    webPort: this.dialogEditPrinter.webPort,
                    isConnecting: true,
                })
                this.$store.dispatch("farm/"+this.dialogEditPrinter.index+"/reconnect")
                this.dialogEditPrinter.bool = false

                this.$store.dispatch("farm/savePrinters")
            },
            delPrinter() {
                this.$store.commit("farm/removePrinter", { name: this.dialogEditPrinter.index })
                this.$store.dispatch("farm/savePrinters")
                this.dialogEditPrinter.bool = false

                this.$store.dispatch("farm/savePrinters")
            },
        }
    }
</script>