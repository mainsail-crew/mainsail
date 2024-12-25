<template>
    <v-dialog v-model="showDialog" width="600" persistent :fullscreen="isMobile">
        <panel :title="$t('Panels.MmuPanel.MmuMaintenance')"
               :icon="mdiWrenchCog"
               card-class="mmu-edit-ttg-map-dialog">
            <template #buttons>
                <v-btn icon tile @click="close">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>

            <v-card-subtitle>
            {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Intro') }}
            </v-card-subtitle>

            <v-card-text>
                <v-row dense>
                    <v-col class="col-6 d-flex justify-center align-center">
                        <span class="settings-row-title">{{ $t('Panels.MmuPanel.MmuMaintenanceDialog.MotorSync') }}</span>
                    </v-col>
                    <v-col class="col-3 d-flex justify-center">
                        <v-btn block small
                               :disabled="!canSend || syncDrive"
                               class="btn-small-text" color="secondary"
                               @click="doLoadingSend('MMU_SYNC_GEAR_MOTOR SYNC=1', 'mmu_sync_gear_motor')">
                            <v-icon left>{{ mdiSync }}</v-icon>
                            {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Sync') }}
                        </v-btn>
                    </v-col>
                    <v-col class="col-3 d-flex justify-center">
                        <v-btn block small
                               :disabled="!canSend || !syncDrive"
                               class="btn-small-text" color="secondary"
                               @click="doLoadingSend('MMU_SYNC_GEAR_MOTOR SYNC=0', 'mmu_sync_gear_motor')">
                            <v-icon left>{{ mdiSyncOff }}</v-icon>
                            {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Unsync') }}
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row dense>
                    <v-col class="col-6 d-flex justify-center align-center">
                        <span class="settings-row-title">{{ $t('Panels.MmuPanel.MmuMaintenanceDialog.ExtruderOnly') }}</span>
                    </v-col>
                    <v-col class="col-3 d-flex justify-center">
                        <v-btn block small
                               :disabled="!canSend"
                               class="btn-small-text" color="secondary"
                               @click="doLoadingSend('MMU_LOAD EXTRUDER_ONLY=1', 'mmu_load')">
                            <v-icon left>{{ mdiDownloadOutline }}</v-icon>
                            {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Load') }}
                        </v-btn>
                    </v-col>
                    <v-col class="col-3 d-flex justify-center">
                        <v-btn block small
                               :disabled="!canSend"
                               class="btn-small-text" color="secondary"
                               @click="doLoadingSend('MMU_UNLOAD EXTRUDER_ONLY=1', 'mmu_unload')">
                            <v-icon left>{{ mdiUploadOutline }}</v-icon>
                            {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Unload') }}
                        </v-btn>
                    </v-col>
                </v-row>

                <v-row dense>
                    <v-col class="col-6 d-flex justify-center">
                        <span class="settings-row-title">{{ $t('Panels.MmuPanel.MmuMaintenanceDialog.MmuMotors') }}</span>
                    </v-col>
                    <v-col class="col-3 d-flex justify-center">
                        <v-btn block small
                               :disabled="!canSend"
                               class="btn-small-text" color="secondary"
                               @click="doLoadingSend('MMU_MOTORS_ON', 'mmu_motors_on')">
                            <v-icon left>{{ mdiEngineOutline }}</v-icon>
                            {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.On') }}
                        </v-btn>
                    </v-col>
                    <v-col class="col-3 d-flex justify-center">
                        <v-btn block small
                               :disabled="!canSend"
                               class="btn-small-text" color="secondary"
                               @click="doLoadingSend('MMU_MOTORS_OFF', 'mmu_motors_off')">
                            <v-icon left>{{ mdiEngineOffOutline }}</v-icon>
                            {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Off') }}
                        </v-btn>
                    </v-col>
                </v-row>

                <!-- PER MMU UNIT CUSTOM CONTROLS -->
                <div v-for="index in unitArray" :key="'unit_' + index">

                    <v-row dense>
                        <v-col cols="12" class="pt-6">
                            <span class="settings-row-subtitle">{{ unitDisplayName(index) }}</span>
                            <v-divider class="mb-1"/>
                        </v-col>
                    </v-row>

                    <v-row v-if="['RotarySelector', 'ServoSelector'].includes(unitDetails(index).selectorType)" dense>
                        <v-col cols="3" class="d-flex align-center">
                            <span class="settings-row-title">{{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Selector') }}</span>
                        </v-col>
                        <v-col class="col-9">
                            <v-row dense>
                                <v-col cols="4" class="d-flex align-center">
                                    <v-btn block small
                                           :disabled="!canSend"
                                           class="btn-small-text" color="secondary"
                                           @click="doLoadingSend('MMU_HOME', 'mmu_home')">
                                        <v-icon left>{{ mdiHomeOutline }}</v-icon>
                                        {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Home') }}
                                    </v-btn>
                                </v-col>
                            </v-row>
                            <v-row dense>
                                <v-col class="col-4 d-flex justify-center">
                                    <v-btn block small
                                           :disabled="!canSend || grip === 'Gripped'"
                                           class="btn-small-text" color="secondary"
                                           @click="doLoadingSend('MMU_GRIP', 'mmu_grip')">
                                        <v-icon left>{{ mdiArrowCollapseHorizontal }}</v-icon>
                                        {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Grip') }}
                                    </v-btn>
                                </v-col>
                                <v-col class="col-4 d-flex justify-center">
                                    <v-btn block small
                                           :disabled="!canSend || grip === 'Released'"
                                           class="btn-small-text" color="secondary"
                                           @click="doLoadingSend('MMU_RELEASE', 'mmu_release')">
                                        <v-icon left>{{ mdiArrowExpandHorizontal }}</v-icon>
                                        {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Release') }}
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>

                    <v-row v-else-if="['LinearSelector'].includes(unitDetails(index).selectorType)" dense>
                        <v-col cols="3" class="d-flex align-center">
                            <span class="settings-row-title">{{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Selector') }}</span>
                        </v-col>
                        <v-col class="col-9">
                            <v-row dense>
                                <v-col cols="4" class="d-flex align-center">
                                    <v-btn block small
                                           :disabled="!canSend"
                                           class="btn-small-text" color="secondary"
                                           @click="doLoadingSend('MMU_HOME', 'mmu_home')">
                                        <v-icon left>{{ mdiHomeOutline }}</v-icon>
                                        {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Home') }}
                                    </v-btn>
                                </v-col>
                            </v-row>
                            <v-row dense>
                                <v-col class="col-4 d-flex justify-center">
                                    <v-btn block small
                                           :disabled="!canSend || servo === 'Up'"
                                           class="btn-small-text" color="secondary"
                                           @click="doLoadingSend('MMU_SERVO POS=up', 'mmu_servo')">
                                        <v-icon left>{{ mdiArrowUpThin }}</v-icon>
                                        {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Up') }}
                                    </v-btn>
                                </v-col>
                                <v-col class="col-4 d-flex justify-center">
                                    <v-btn block small
                                           :disabled="!canSend || servo === 'Down'"
                                           class="btn-small-text" color="secondary"
                                           @click="doLoadingSend('MMU_SERVO POS=down', 'mmu_servo')">
                                        <v-icon left>{{ mdiArrowDownThin }}</v-icon>
                                        {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Down') }}
                                    </v-btn>
                                </v-col>
                                <v-col class="col-4 d-flex justify-center">
                                    <v-btn block small
                                           :disabled="!canSend || servo === 'Move'"
                                           class="btn-small-text" color="secondary"
                                           @click="doLoadingSend('MMU_SERVO POS=move', 'mmu_servo')">
                                        <v-icon left>{{ mdiArrowLeftRight }}</v-icon>
                                        {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Move') }}
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>

                    <v-row v-else dense>
                        <v-col cols="3" class="d-flex align-center">
                            <span class="settings-row-subtitle">{{ $t('Panels.MmuPanel.MmuMaintenanceDialog.NoCustomControls') }}</span>
                        </v-col>
                    </v-row>

                </div>

                <v-row dense>
                    <v-col cols="12" class="pt-10">
                        <span class="settings-row-subtitle">{{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Config') }}</span>
                        <v-divider class="mb-6 mt-1"/>
                    </v-col>
                </v-row>

                <v-row dense>
                    <v-col cols="3" class="d-flex align-center">
                        <v-col class="d-flex flex-column pa-0 my-3">
                            <span class="settings-row-title">{{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Leds') }}</span>
                            <v-switch v-model="localLedEnable"
                                      :disabled="!mmuLeds"
                                      :label="$t('Panels.MmuPanel.MmuMaintenanceDialog.Enable')"
                                      hide-details class="short-switch"/>
                            <v-switch v-model="localLedAnimation"
                                      :disabled="!ledEffectModule"
                                      :label="$t('Panels.MmuPanel.MmuMaintenanceDialog.Animation')"
                                      hide-details class="short-switch"/>
                        </v-col>
                    </v-col>
                    <v-col cols="7">
                        <v-row dense :class="{ 'disabled-row': !hasLedsOfType('entry') }">
                            <v-col class="col-4 d-flex justify-end align-center pr-6">
                                Entry
                            </v-col>
                            <v-col class="col-8 d-flex align-center">
                                <v-select :items="LED_OPTIONS"
                                          :disabled="!hasLedsOfType('entry')"
                                          v-model="localEntryEffect"
                                          hide-details outlined dense/>
                            </v-col>
                        </v-row>
                        <v-row dense :class="{ 'disabled-row': !hasLedsOfType('exit') }">
                            <v-col class="col-4 d-flex justify-end align-center pr-6">
                                Exit
                            </v-col>
                            <v-col class="col-8 d-flex align-center">
                                <v-select :items="LED_OPTIONS"
                                          :disabled="!hasLedsOfType('exit')"
                                          v-model="localExitEffect"
                                          hide-details outlined dense/>
                            </v-col>
                        </v-row>
                        <v-row dense :class="{ 'disabled-row': !hasLedsOfType('status') }">
                            <v-col class="col-4 d-flex justify-end align-center pr-6">
                                Status
                            </v-col>
                            <v-col class="col-8 d-flex align-center">
                                <v-select :items="LED_STATUS_OPTIONS"
                                          :disabled="!hasLedsOfType('status')"
                                          v-model="localStatusEffect"
                                          hide-details outlined dense/>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="2" class="d-flex align-center justify-center">
                        <v-btn class="btn-no-text" color="secondary"
                               :disabled="!canSend"
                               @click="updateLeds">
                            <v-icon>{{ mdiContentSaveSettingsOutline }}</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>

                <v-row dense class="mt-4">
                    <v-col cols="3" class="d-flex align-center">
                        <span class="settings-row-title">{{ $t('Panels.MmuPanel.MmuMaintenanceDialog.UiVisual') }}</span>
                    </v-col>
                    <v-col cols="7">
                        <v-row dense>
                            <v-col class="col-4 d-flex justify-end align-center pr-6">
                                {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.ExtruderTx') }}
                            </v-col>
                            <v-col class="col-8 d-flex align-center">
                                <v-select :items="T_MACRO_COLOR_OPTIONS"
                                          v-model="localTMacroColor"
                                          hide-details outlined dense/>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-card-actions>
                <v-spacer/>
                <v-btn color="primary" text @click="close">
                    {{ $t('Panels.MmuPanel.Ok') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiWrenchCog, mdiSync, mdiSyncOff, mdiDownloadOutline, mdiUploadOutline, mdiEngineOutline, mdiEngineOffOutline,
         mdiHomeOutline, mdiArrowDownThin, mdiArrowUpThin, mdiArrowLeftRight, mdiArrowCollapseHorizontal, mdiArrowExpandHorizontal,
         mdiContentSaveSettingsOutline } from '@mdi/js'

@Component({
    components: { Panel }
})
export default class MmuMaintainanceStateDialog extends Mixins(BaseMixin, MmuMixin) {
    mdiCloseThick = mdiCloseThick
    mdiWrenchCog = mdiWrenchCog
    mdiSync = mdiSync
    mdiSyncOff = mdiSyncOff
    mdiDownloadOutline = mdiDownloadOutline
    mdiUploadOutline = mdiUploadOutline
    mdiEngineOutline = mdiEngineOutline
    mdiEngineOffOutline = mdiEngineOffOutline
    mdiHomeOutline = mdiHomeOutline
    mdiArrowDownThin = mdiArrowDownThin
    mdiArrowUpThin = mdiArrowUpThin
    mdiArrowLeftRight = mdiArrowLeftRight
    mdiArrowCollapseHorizontal = mdiArrowCollapseHorizontal
    mdiArrowExpandHorizontal = mdiArrowExpandHorizontal
    mdiContentSaveSettingsOutline = mdiContentSaveSettingsOutline

    @Prop({ required: true }) readonly showDialog!: boolean;

    private localLedEnable: boolean = true
    private localLedAnimation: boolean = true
    private localEntryEffect: string = 'off'
    private localExitEffect: string = 'off'
    private localStatusEffect: string = 'off'
    private localTMacroColor: string = 'slicer'

    @Watch('showDialog')
    onShowDialogChanged(newValue: boolean): void {
        if (newValue) {
            this.localLedEnable = this.macroVarsLedEnable
            this.localLedAnimation = this.macroVarsLedAnimation
            this.localEntryEffect = this.macroVarsDefaultEntryEffect
            this.localExitEffect = this.macroVarsDefaultExitEffect
            this.localStatusEffect = this.macroVarsDefaultStatusEffect
            this.localTMacroColor = this.configTMacroColor
        }
    }

    get unitArray(): number[] {
        return Array.from({ length: this.numUnits }, (_, k) => k)
    }

    get mmuLeds(): boolean {
        return !!this.$store.state.printer.mmu_leds;
    }

    private hasLedsOfType(type: string): boolean {
        return (this.$store.state.printer.mmu_leds?.[type] ?? 0) > 0
    }

    get ledEffectModule(): boolean {
        return this.$store.state.printer.mmu_leds?.led_effect_module ?? false
    }

    private unitDisplayName(unit: number): string {
        const name = this.unitDetails(unit).name
        return `MMU #${unit + 1} - ${name}`
    }

    private updateLeds() {
        const command: string = `
            MMU_LED QUIET=1
            ENABLE=${this.localLedEnable ? 1 : 0}
            ANIMATION=${this.localLedAnimation ? 1 : 0}
            ENTRY_EFFECT=${this.localEntryEffect}
            EXIT_EFFECT=${this.localExitEffect}
            STATUS_EFFECT=${this.localStatusEffect}
        `.replace(/\s+/g, ' ').trim()
        this.doLoadingSend(command, 'mmu_led')

        this.updateTMacroColor()
    }

    private updateTMacroColor() {
        const command: string = `MMU_TEST_CONFIG QUIET=1 t_macro_color=${this.localTMacroColor}`
        this.doLoadingSend(command, 'mmu_test_config')
    }

    close() {
        this.$emit('close')
    }
}
</script>

<style scoped>
.settings-row-title {
    display: block;
    width: 100%;
    font-weight: bold;
}

.settings-row-subtitle {
    display: block;
    font-size: 0.8em;
    line-height: 1.3;
    margin-top: 3px;
}

.short-switch {
    padding-top: 4px;
    margin-top: 2px;
    margin-bottom: 4px;
}

::v-deep .short-switch .v-label {
    font-size: 0.8em;
}

.btn-small-text {
    font-size: 0.8em;
}

.btn-small-text .v-icon {
    margin-right: 4px;
}

.btn-no-text {
    height: 50% !important;
}

.btn-no-text .v-icon {
    margin-right: 0;
}

.disabled-row {
    opacity: 0.5;
}
</style>
