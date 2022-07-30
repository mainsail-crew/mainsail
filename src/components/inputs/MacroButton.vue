<template>
    <v-item-group class="d-inline-block">
        <v-btn
            small
            :color="color"
            :class="paramArray.length ? 'macroWithParameters' : ''"
            :loading="loadings.includes('macro_' + macro.name)"
            :disabled="disabled"
            @click="doSendMacro(macro.name)">
            {{ alias ? alias : macro.name.replace(/_/g, ' ') }}
        </v-btn>
        <template v-if="paramArray.length">
            <v-menu offset-y :close-on-content-click="false">
                <template #activator="{ on, attrs }">
                    <v-btn small :color="color" v-bind="attrs" class="minwidth-0 px-1 btnMacroMenu" v-on="on">
                        <v-icon>{{ mdiMenuDown }}</v-icon>
                    </v-btn>
                </template>
                <v-card max-width="200">
                    <v-card-text class="py-2">
                        <v-row v-for="(name, key) in paramArray" :key="'param_' + key" class="my-2">
                            <v-col class="py-0">
                                <v-text-field
                                    v-model="params[name].value"
                                    :label="name"
                                    :placeholder="params[name].default"
                                    :persistent-placeholder="true"
                                    hide-details
                                    outlined
                                    dense
                                    clearable
                                    :clear-icon="mdiRefresh"
                                    @keyup.enter="sendWithParams"></v-text-field>
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
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { GuiMacrosStateMacrogroupMacro } from '@/store/gui/macros/types'
import { mdiMenuDown, mdiRefresh } from '@mdi/js'

interface param {
    type: 'int' | 'double' | 'string' | null
    default: string | number | null
    value: string | number | null
}

interface params {
    [key: string]: param
}

@Component
export default class MacroButton extends Mixins(BaseMixin) {
    /**
     * Icons
     */
    mdiMenuDown = mdiMenuDown
    mdiRefresh = mdiRefresh

    private paramArray: string[] = []
    private params: params = {}

    @Prop({ required: true })
    declare readonly macro: GuiMacrosStateMacrogroupMacro

    @Prop({ default: 'primary' })
    declare readonly color: string

    @Prop({ default: null })
    declare readonly alias: string

    @Prop({ default: false })
    declare readonly disabled: boolean

    get klipperMacro() {
        return this.$store.getters['printer/getMacro'](this.macro.name)
    }

    get isGcodeStyle() {
        return this.macro.name.match(/[G|M]\d{1,3}/gm)
    }

    @Watch('klipperMacro')
    klipperMacroChange() {
        this.refreshParams()
    }

    refreshParams() {
        this.paramArray.splice(0, this.paramArray.length)
        this.params = {}

        if (this.klipperMacro?.params !== null) {
            Object.keys(this.klipperMacro.params).forEach((name: string) => {
                if (!name.startsWith('_')) {
                    this.paramArray.push(name)
                    this.params[name] = {
                        type: this.klipperMacro.params[name].type,
                        default: this.klipperMacro.params[name].default,
                        value: '',
                    }
                }
            })
        }
    }

    doSendMacro(gcode: string) {
        this.$store.dispatch('server/addEvent', {
            message: gcode,
            type: 'command',
        })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'macro_' + gcode })
    }

    sendWithParams() {
        let params: string[] = []
        this.paramArray.forEach((paramname: string) => {
            if (this.params[paramname].value !== null && this.params[paramname].value !== '') {
                let tmp: string = paramname
                tmp += this.isGcodeStyle ? this.params[paramname].value : `=${this.params[paramname].value}`

                params.push(tmp)
            }
        })

        const gcode = this.macro.name + ' ' + params.join(' ')
        this.doSendMacro(gcode)
    }

    mounted() {
        this.refreshParams()
    }
}
</script>

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
