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
            <v-menu v-if="!isMobile" offset-y :close-on-content-click="false">
                <template #activator="{ on, attrs }">
                    <v-btn
                        :disabled="disabled"
                        :color="color"
                        v-bind="attrs"
                        class="minwidth-0 px-1 btnMacroMenu"
                        small
                        v-on="on">
                        <v-icon>{{ mdiMenuDown }}</v-icon>
                    </v-btn>
                </template>
                <v-card :max-width="paramsOverlayWidth">
                    <v-card-text class="py-2">
                        <v-row class="my-2">
                            <v-col v-for="(name, key) in paramArray" :key="'param_' + key" :cols="paramCssCols">
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
            <template v-else>
                <v-btn
                    :disabled="disabled"
                    :color="color"
                    class="minwidth-0 px-1 btnMacroMenu"
                    small
                    @click="paramsDialog = true">
                    <v-icon>{{ mdiMenuDown }}</v-icon>
                </v-btn>
                <v-dialog v-model="paramsDialog">
                    <panel :title="macro.name" :card-class="`macro-params-mobile-${macro.name}`" :margin-bottom="false">
                        <template #buttons>
                            <v-btn icon tile @click="paramsDialog = false">
                                <v-icon>{{ mdiCloseThick }}</v-icon>
                            </v-btn>
                        </template>
                        <v-card-text>
                            <v-row>
                                <v-col v-for="(name, key) in paramArray" :key="'param_mobile_' + key" :cols="6">
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
                        </v-card-text>
                        <v-card-actions class="px-4 pb-4">
                            <v-btn color="primary" class="text-uppercase" block @click="sendWithParams">
                                {{ $t('Panels.MacrosPanel.Send') }}
                            </v-btn>
                        </v-card-actions>
                    </panel>
                </v-dialog>
            </template>
        </template>
    </v-item-group>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { GuiMacrosStateMacrogroupMacro } from '@/store/gui/macros/types'
import { mdiCloseThick, mdiMenuDown, mdiRefresh } from '@mdi/js'
import Panel from '@/components/ui/Panel.vue'
import { TranslateResult } from 'vue-i18n'
import { PrinterStateMacro } from '@/store/printer/types'

interface param {
    type: 'int' | 'double' | 'string' | null
    default: string | number | null
    value: string | number | null
}

interface params {
    [key: string]: param
}

@Component({
    components: { Panel },
})
export default class MacroButton extends Mixins(BaseMixin) {
    /**
     * Icons
     */
    mdiCloseThick = mdiCloseThick
    mdiMenuDown = mdiMenuDown
    mdiRefresh = mdiRefresh

    private paramArray: string[] = []
    private params: params = {}
    private paramsDialog = false

    @Prop({ required: true })
    declare readonly macro: GuiMacrosStateMacrogroupMacro | PrinterStateMacro

    @Prop({ default: 'primary' })
    declare readonly color: string

    @Prop({ default: null })
    declare readonly alias: string | TranslateResult

    @Prop({ default: false })
    declare readonly disabled: boolean

    get klipperMacro() {
        return this.$store.getters['printer/getMacro'](this.macro.name)
    }

    get isGcodeStyle() {
        return this.macro.name.match(/[G|M]\d{1,3}/gm)
    }

    get paramCols() {
        if (this.isMobile) return 1

        const cols = Math.ceil(this.paramArray.length / 5)

        if (cols > 4) return 4

        return cols
    }

    get paramCssCols() {
        return 12 / this.paramCols
    }

    get paramsOverlayWidth() {
        return 200 * this.paramCols
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
            let value = this.params[paramname].value?.toString().trim()

            if (this.params[paramname].value !== null && value !== '') {
                let tmp: string = paramname
                if (value?.includes(' ')) value = `"${value}"`

                tmp += this.isGcodeStyle ? value : `=${value}`

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
