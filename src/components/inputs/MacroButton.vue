<template>
    <v-item-group class="d-inline-block">
        <v-btn
            small
            :color="color"
            :class="paramArray.length ? 'macroWithParameters' : ''"
            :loading="loadings.includes('macro_' + macro.name)"
            :disabled="disabled || paramsRequired"
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
                        <v-form ref="form">
                            <v-row class="my-2">
                                <v-col v-for="(param, key) in paramArray" :key="'param_' + key" :cols="paramCssCols">
                                    <v-select
                                        v-if="param.type == 'select'"
                                        v-model="param.value"
                                        :label="param.name"
                                        :items="param.hints?.options"
                                        hide-details
                                        outlined
                                        clearable
                                        :clear-icon="mdiRefresh"
                                        dense></v-select>
                                    <v-checkbox
                                        v-else-if="param.type == 'checkbox'"
                                        v-model="param.value"
                                        :label="param.name"
                                        :true-value="(param.hints?.options ?? [])[0] ?? 1"
                                        :false-value="(param.hints?.options ?? [])[1] ?? 0"
                                        hide-details
                                        outlined
                                        dense></v-checkbox>
                                    <v-text-field
                                        v-else
                                        v-model="param.value"
                                        :label="param.name"
                                        :rules="param.rules"
                                        :type="param.fieldType"
                                        :placeholder="param.default ?? ''"
                                        :persistent-placeholder="true"
                                        hide-details
                                        hide-spin-buttons
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
                        </v-form>
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
                    <panel :title="macro.name" :card-class="`macro-params-mobile-${macro.name}`" :margin-bottom="0">
                        <v-form ref="form">
                            <template #buttons>
                                <v-btn icon tile @click="paramsDialog = false">
                                    <v-icon>{{ mdiCloseThick }}</v-icon>
                                </v-btn>
                            </template>
                            <v-card-text>
                                <v-row>
                                    <v-col v-for="(param, key) in paramArray" :key="'param_mobile_' + key" :cols="6">
                                        <v-select
                                            v-if="value.type == 'select'"
                                            v-model="param.value"
                                            :label="param.name"
                                            :items="param.hints?.options"
                                            hide-details
                                            outlined
                                            clearable
                                            :clear-icon="mdiRefresh"
                                            dense></v-select>
                                        <v-checkbox
                                            v-else-if="param.type == 'checkbox'"
                                            v-model="param.value"
                                            :label="param.name"
                                            :true-value="param.hints?.options[0] ?? 1"
                                            :false-value="param.hints?.options[1] ?? 0"
                                            hide-details
                                            outlined
                                            dense></v-checkbox>
                                        <v-text-field
                                            v-else
                                            v-model="param.value"
                                            :label="param.name"
                                            :rules="param.rules"
                                            :type="param.fieldType"
                                            :placeholder="param.default ?? ''"
                                            :persistent-placeholder="true"
                                            hide-spin-buttons
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
                        </v-form>
                    </panel>
                </v-dialog>
            </template>
        </template>
    </v-item-group>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Ref, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { GuiMacrosStateMacrogroupMacro } from '@/store/gui/macros/types'
import { mdiCloseThick, mdiMenuDown, mdiRefresh } from '@mdi/js'
import Panel from '@/components/ui/Panel.vue'
import { PrinterStateMacroParam } from '@/store/printer/types'

interface NamedUiParam extends PrinterStateMacroParam {
    value?: string | number | null
    name: string
    fieldType?: string | null
    rules: any[] | undefined
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

    private params: { [key: string]: PrinterStateMacroParam } = {}
    private paramsDialog = false

    get paramArray(): NamedUiParam[] {
        // Sort first with parameters that need values, then alphabetically.
        let params = this.params
        let paramList: string[] = Object.keys(params)
        paramList.sort()

        function makeRules(param: PrinterStateMacroParam): any[] {
            let check_range = function (value: string, option: string, compare: Function): boolean {
                let test = (param.hints ?? {})[option]
                if (test == null || !value) return true

                if (param.type == 'int') {
                    return compare(value - test)
                }
                if (param.type == 'float') return compare(parseFloat(value) - test)
                return compare(value.length - test)
            }
            return [
                (v: string) => !v || param.type != 'float' || !Number.isNaN(parseFloat(v)),
                (v: string) => !v || param.type != 'int' || Number.isInteger(parseFloat(v)),
                (v: string) => check_range(v, 'max', (d) => d <= 0),
                (v: string) => check_range(v, 'min', (d) => d >= 0),
                (v: string) => check_range(v, 'below', (d) => d < 0),
                (v: string) => check_range(v, 'above', (d) => d > 0),
                (v: string) => !!v || !!param?.default || !param?.hints?.required,
            ]
        }

        let hasHints: boolean = this.klipperMacro.variables?.front_end_hints
        return paramList.map((name) => ({
            ...{
                name: name,
                fieldType: ['int', 'float'].includes(params[name].type) ? 'number' : null,
                rules: hasHints ? makeRules(params[name]) : undefined,
                value: ['select', 'checkbox'].includes(params[name].type ?? '')
                    ? String(params[name].default ?? '')
                    : null,
            },
            ...params[name],
        }))
    }

    get paramsRequired(): boolean {
        for (const [, param] of Object.entries(this.params)) {
            if (param?.hints?.required && !param?.default) return true
        }
        return false
    }

    @Prop({ required: true })
    declare readonly macro: GuiMacrosStateMacrogroupMacro

    @Prop({ default: 'primary' })
    declare readonly color: string

    @Prop({ default: null })
    declare readonly alias: string

    @Prop({ default: false })
    declare readonly disabled: boolean

    @Ref('form')
    declare readonly form

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

    @Watch('klipperMacro', { deep: true, immediate: true })
    klipperMacroChange() {
        this.refreshParams()
    }

    refreshParams() {
        this.$set(this, 'params', this.klipperMacro?.params ?? {})
    }

    doSendMacro(gcode: string) {
        this.$store.dispatch('server/addEvent', {
            message: gcode,
            type: 'command',
        })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'macro_' + gcode })
    }

    sendWithParams() {
        if (!this.form.validate()) return
        let params: string[] = []
        this.paramArray.forEach((param) => {
            if (
                param.value !== null &&
                param.value !== '' &&
                (!['select', 'checkbox'].includes(param.type) || param.value !== param.default)
            ) {
                let tmp: string = param.name
                tmp += this.isGcodeStyle ? param.value : `=${param.value}`

                params.push(tmp)
            }
        })

        const gcode = this.macro.name + ' ' + params.join(' ')
        this.doSendMacro(gcode)
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
