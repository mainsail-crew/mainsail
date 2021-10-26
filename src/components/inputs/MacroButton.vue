<style scoped>
    .btnMacroMenu {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }

    .macroWithParameters {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }
</style>

<template>
    <v-item-group class="d-inline-block">
        <v-btn
            small
            :color="color"
            :class="paramArray.length ? 'macroWithParameters' : ''"
            :loading="loadings.includes('macro_'+macro.name)"
            @click="doSendMacro(macro.name)">
            {{ macro.name.replace(/_/g, " ") }}
        </v-btn>
        <template v-if="paramArray.length">
            <v-menu offset-y :close-on-content-click="false">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        small
                        :color="color"
                        v-bind="attrs"
                        v-on="on"
                        class="minwidth-0 px-1 btnMacroMenu"
                    >
                        <v-icon>mdi-menu-down</v-icon>
                    </v-btn>
                </template>
                <v-card max-width="200">
                    <v-card-text>
                        <v-row v-for="(name, key) in paramArray" :key="'param_'+key" class="my-2">
                            <v-col class="py-0">
                                <v-text-field
                                    :label="name"
                                    v-model="params[name].value"
                                    hide-details
                                    outlined
                                    dense
                                >
                                    <template v-slot:append>
                                        <v-btn
                                            v-if="params[name].value !== params[name].default"
                                            @click="params[name].value = params[name].default"
                                            icon
                                            small>
                                            <v-icon>mdi-refresh</v-icon>
                                        </v-btn>
                                    </template>
                                </v-text-field>
                            </v-col>
                        </v-row>
                        <v-row class="my-2">
                            <v-col class="py-0">
                                <v-btn color="primary" class="text-uppercase" block @click="sendWithParams">
                                    {{ $t('Panels.MacrosPanel.Send') }}
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-menu>
        </template>
    </v-item-group>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import {Mixins, Prop, Watch} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {GuiStateMacrogroupMacros} from '@/store/gui/types'

interface param {
    type: 'int' | 'double' | 'string' | null,
    default: string | null
    value: string | null
}

interface params {
    [key: string]: param
}

@Component
export default class MacroButton extends Mixins(BaseMixin) {
    private paramArray: string[] = []
    private params: params = {}

    @Prop({ required: true }) readonly macro!: GuiStateMacrogroupMacros
    @Prop({ default: 'primary' }) readonly color!: string

    get klipperMacro() {
        return this.$store.getters['printer/getMacro'](this.macro.name)
    }

    @Watch('klipperMacro')
    klipperMacroChange() {
        this.refreshParams()
    }

    refreshParams() {
        this.paramArray.splice(0, this.paramArray.length)
        this.params = {}

        if (this.klipperMacro.params !== null) {
            Object.keys(this.klipperMacro.params).forEach((name: string) => {
                this.paramArray.push(name)
                this.params[name] = {
                    type: this.klipperMacro.params[name].type,
                    default: this.klipperMacro.params[name].default,
                    value: this.klipperMacro.params[name].default
                }
            })
        }
    }

    doSendMacro(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'macro_'+gcode })
    }

    sendWithParams() {
        let params: string[] = []
        this.paramArray.forEach((paramname: string) => {
            if (this.params[paramname].value !== null && this.params[paramname].value !== '')
                params.push(paramname+'='+this.params[paramname].value)
        })

        const gcode = this.macro.name + ' ' +params.join(' ')
        this.doSendMacro(gcode)
    }

    mounted(){
        this.refreshParams()
    }
}
</script>