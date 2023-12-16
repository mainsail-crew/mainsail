<template>
    <div>
        <v-row>
            <v-col class="pa-0 mt-1">
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 78 62"
                    xmlns="http://www.w3.org/2000/svg"
                    xml:space="preserve"
                    style="fill-rule: evenodd; clip-rule: evenodd; stroke-linejoin: round; stroke-miterlimit: 2">
                    <g id="ArtBoard1" transform="matrix(1.24239,0,0,1,0,0)">
                        <rect x="0" y="0" width="62" height="62" style="fill: none" />
                        <g id="home_buttons" transform="matrix(0.804902,0,0,1,0.0430241,0)">
                            <!-- HOME X BUTTON -->
                            <a :class="xHomeClass" @click="doHomeX">
                                <g
                                    id="home_x"
                                    transform="matrix(0.707107,-0.707107,0.707107,0.707107,-1.41799,4.05689)">
                                    <g
                                        id="home_button_x"
                                        class="home_button"
                                        transform="matrix(0.68689,0.68689,-0.68689,0.68689,3.87132,0.962447)">
                                        <path :d="pathHomeButtonTop" />
                                    </g>
                                    <g transform="matrix(0.654426,0,0,0.654426,0.298666,4.01315)">
                                        <text x="3.789px" y="6.089px">X</text>
                                    </g>
                                    <g
                                        id="Icon"
                                        class="home_icon"
                                        transform="matrix(0.147059,0,0,0.147059,2.10662,2.08254)">
                                        <path :d="homeIcon" style="fill-rule: nonzero" />
                                    </g>
                                </g>
                            </a>
                            <!-- HOME Y BUTTON -->
                            <a :class="yHomeClass" @click="doHomeY">
                                <g
                                    id="home_y"
                                    transform="matrix(0.707107,0.707107,-0.707107,0.707107,57.8807,-1.41799)">
                                    <g
                                        id="home_button_y"
                                        class="home_button"
                                        transform="matrix(0.68689,0.68689,-0.68689,0.68689,3.87132,0.962447)">
                                        <path :d="pathHomeButtonTop" />
                                    </g>
                                    <g transform="matrix(0.654426,0,0,0.654426,0.298666,4.01315)">
                                        <text x="3.789px" y="6.089px">Y</text>
                                    </g>
                                    <g
                                        id="icon"
                                        class="home_icon"
                                        transform="matrix(0.147059,0,0,0.147059,2.10662,2.08254)">
                                        <path :d="homeIcon" style="fill-rule: nonzero" />
                                    </g>
                                </g>
                            </a>
                            <!-- HOME Z BUTTON -->
                            <a :class="zHomeClass" @click="doHomeZ">
                                <g
                                    id="home_z"
                                    transform="matrix(-0.707107,0.707107,-0.707107,-0.707107,63.3555,57.8807)">
                                    <g
                                        id="home_button_z"
                                        class="home_button"
                                        transform="matrix(0.68689,0.68689,-0.68689,0.68689,3.87132,0.962447)">
                                        <path :d="pathHomeButtonBottom" />
                                    </g>
                                    <g transform="matrix(0.654426,0,0,0.654426,0.298666,4.01315)">
                                        <text x="3.93px" y="6.089px">Z</text>
                                    </g>
                                    <g
                                        id="icon1"
                                        class="home_icon"
                                        transform="matrix(0.147059,0,0,0.147059,2.10662,2.08254)">
                                        <path :d="homeIcon" style="fill-rule: nonzero" />
                                    </g>
                                </g>
                            </a>
                            <!-- HOME XY BUTTON -->
                            <a v-if="enableXYHoming" :class="xyHomeClass" @click="doHomeXY">
                                <g
                                    id="home_xy"
                                    transform="matrix(-0.707107,-0.707107,0.707107,-0.707107,4.05689,63.3555)">
                                    <g
                                        id="home_button_xy"
                                        class="home_button"
                                        transform="matrix(0.68689,0.68689,-0.68689,0.68689,3.87132,0.962447)">
                                        <path :d="pathHomeButtonBottom" />
                                    </g>
                                    <g transform="matrix(0.654426,0,0,0.654426,0.298666,4.01315)">
                                        <text x="2.3px" y="6.089px">XY</text>
                                    </g>
                                    <g
                                        id="icon2"
                                        class="home_icon"
                                        transform="matrix(0.147059,0,0,0.147059,2.10662,2.08254)">
                                        <path :d="homeIcon" style="fill-rule: nonzero" />
                                    </g>
                                </g>
                            </a>
                            <!-- HOME ALL BUTTON -->
                            <a v-else :class="xyzHomeClass" @click="doHome">
                                <g
                                    id="home_all"
                                    transform="matrix(-0.707107,-0.707107,0.707107,-0.707107,4.05689,63.3555)">
                                    <g
                                        id="home_button_all"
                                        class="home_button"
                                        transform="matrix(0.68689,0.68689,-0.68689,0.68689,3.87132,0.962447)">
                                        <path :d="pathHomeButtonBottom" />
                                    </g>
                                    <g
                                        id="icon3"
                                        class="home_icon"
                                        transform="matrix(0.29377,0,0,0.29377,0.346087,1.64241)">
                                        <path :d="homeIcon" style="fill-rule: nonzero" />
                                    </g>
                                </g>
                            </a>
                            <!-- HOME ALL BUTTON IN THE CENTER -->
                            <a v-if="enableXYHoming" :class="xyzHomeClass" @click="doHome">
                                <g id="home_all_center" class="home_button">
                                    <circle id="home_button_all_center" cx="31" cy="31" r="5" />
                                </g>
                                <g id="icon4" class="home-icon" transform="scale(0.3) translate(91.25,91.25)">
                                    <!-- transform="matrix(0.29377,0,0,0.29377,0.346087,1.64241)"-->
                                    <path :d="homeIcon" style="fill-rule: nonzero" />
                                </g>
                            </a>
                        </g>
                        <g id="step_buttons" transform="matrix(0.804902,0,0,1,0.0430241,0)">
                            <!-- Z STEPS BUTTONS -->
                            <g id="Z" transform="matrix(1.24239,0,0,1,-0.0534526,0)">
                                <g
                                    id="Bottom"
                                    :class="zStepClass"
                                    transform="matrix(-1,-1.52149e-16,9.85721e-17,-1,114.34,62)">
                                    <a
                                        class="step inner"
                                        @click="
                                            doSendMove(
                                                `Z${!reverseZ ? '-' : '+'}${stepsZ.length >= 0 ? stepsZ[0] : 0}`,
                                                feedrateZ
                                            )
                                        ">
                                        <g transform="matrix(0.804902,0,0,1,0,0)"><path :d="zStepInner" /></g>
                                    </a>
                                    <a
                                        class="step inner-mid"
                                        @click="
                                            doSendMove(
                                                `Z${!reverseZ ? '-' : '+'}${stepsZ.length >= 1 ? stepsZ[1] : 0}`,
                                                feedrateZ
                                            )
                                        ">
                                        <g
                                            transform="matrix(0.804902,1.2326e-32,-9.92118e-33,1,-5.71917e-15,-7.10543e-15)">
                                            <path :d="zStepInnerMid" />
                                        </g>
                                    </a>
                                    <a
                                        class="step outer-mid"
                                        @click="
                                            doSendMove(
                                                `Z${!reverseZ ? '-' : '+'}${stepsZ.length >= 2 ? stepsZ[2] : 0}`,
                                                feedrateZ
                                            )
                                        ">
                                        <g transform="matrix(0.804902,0,0,1,0,0)">
                                            <path :d="zStepOuterMid" />
                                        </g>
                                    </a>
                                    <a
                                        class="step outer"
                                        @click="
                                            doSendMove(
                                                `Z${!reverseZ ? '-' : '+'}${stepsZ.length >= 3 ? stepsZ[3] : 0}`,
                                                feedrateZ
                                            )
                                        ">
                                        <g transform="matrix(0.804902,0,0,1,0,0)">
                                            <path :d="zStepOuter" />
                                        </g>
                                    </a>
                                </g>
                                <g id="Top" :class="zStepClass">
                                    <a
                                        class="step inner"
                                        @click="
                                            doSendMove(
                                                `Z${reverseZ ? '-' : '+'}${stepsZ.length >= 0 ? stepsZ[0] : 0}`,
                                                feedrateZ
                                            )
                                        ">
                                        <g transform="matrix(0.804902,0,0,1,0,0)">
                                            <path :d="zStepInner" />
                                        </g>
                                    </a>
                                    <a
                                        class="step inner-mid"
                                        @click="
                                            doSendMove(
                                                `Z${reverseZ ? '-' : '+'}${stepsZ.length >= 1 ? stepsZ[1] : 0}`,
                                                feedrateZ
                                            )
                                        ">
                                        <g
                                            transform="matrix(0.804902,1.2326e-32,-9.92118e-33,1,-5.71917e-15,-7.10543e-15)">
                                            <path :d="zStepInnerMid" />
                                        </g>
                                    </a>
                                    <a
                                        class="step outer-mid"
                                        @click="
                                            doSendMove(
                                                `Z${reverseZ ? '-' : '+'}${stepsZ.length >= 2 ? stepsZ[2] : 0}`,
                                                feedrateZ
                                            )
                                        ">
                                        <g transform="matrix(0.804902,0,0,1,0,0)">
                                            <path :d="zStepOuterMid" />
                                        </g>
                                    </a>
                                    <a
                                        class="step outer"
                                        @click="
                                            doSendMove(
                                                `Z${reverseZ ? '-' : '+'}${stepsZ.length >= 3 ? stepsZ[3] : 0}`,
                                                feedrateZ
                                            )
                                        ">
                                        <g transform="matrix(0.804902,0,0,1,0,0)">
                                            <path :d="zStepOuter" />
                                        </g>
                                    </a>
                                </g>
                            </g>
                            <!-- Z STEP BUTTON TEXT -->
                            <g id="stepsZ" :class="zStepClass" transform="matrix(1,0,0,1,40,0)">
                                <g transform="matrix(1,0,0,1,0.483899,4.07983)">
                                    <text x="30.7px" y="19.056px" text-anchor="middle">
                                        {{ stepsZ.length >= 0 ? stepsZ[0] : '--' }}
                                    </text>
                                </g>
                                <g transform="matrix(1,0,0,1,0.220227,-1.95729)">
                                    <text x="30.7px" y="19.056px" text-anchor="middle">
                                        {{ stepsZ.length >= 1 ? stepsZ[1] : '--' }}
                                    </text>
                                </g>
                                <g transform="matrix(1,0,0,1,0.220227,-7.99441)">
                                    <text x="30.7px" y="19.056px" text-anchor="middle">
                                        {{ stepsZ.length >= 2 ? stepsZ[2] : '--' }}
                                    </text>
                                </g>
                                <g transform="matrix(1,0,0,1,0.220227,-14.0315)">
                                    <text x="30.7px" y="19.056px" text-anchor="middle">
                                        {{ stepsZ.length >= 3 ? stepsZ[3] : '--' }}
                                    </text>
                                </g>
                            </g>
                            <!-- XY STEP BUTTONS -->
                            <g id="XY">
                                <g id="Right" :class="xStepClass">
                                    <a
                                        class="step inner"
                                        @click="
                                            doSendMove(
                                                `X${reverseX ? '-' : '+'}${stepsXY.length >= 0 ? stepsXY[0] : 0}`,
                                                feedrateXY
                                            )
                                        ">
                                        <g transform="matrix(0.48,0,0,0.48,19,19)">
                                            <path :d="xyStepInner" />
                                        </g>
                                    </a>
                                    <a
                                        class="step inner-mid"
                                        @click="
                                            doSendMove(
                                                `X${reverseX ? '-' : '+'}${stepsXY.length >= 1 ? stepsXY[1] : 0}`,
                                                feedrateXY
                                            )
                                        ">
                                        <g transform="matrix(0.72,0,0,0.72,13,13)">
                                            <path :d="xyStepInnerMid" />
                                        </g>
                                    </a>
                                    <a
                                        class="step outer-mid"
                                        @click="
                                            doSendMove(
                                                `X${reverseX ? '-' : '+'}${stepsXY.length >= 2 ? stepsXY[2] : 0}`,
                                                feedrateXY
                                            )
                                        ">
                                        <g transform="matrix(0.96,0,0,0.96,7,7)">
                                            <path :d="xyStepOuterMid" />
                                        </g>
                                    </a>
                                    <a
                                        class="step outer"
                                        @click="
                                            doSendMove(
                                                `X${reverseX ? '-' : '+'}${stepsXY.length >= 3 ? stepsXY[3] : 0}`,
                                                feedrateXY
                                            )
                                        ">
                                        <g transform="matrix(1.2,0,0,1.2,1,1)">
                                            <path :d="xyStepOuter" />
                                        </g>
                                    </a>
                                </g>
                                <g
                                    id="Left"
                                    :class="xStepClass"
                                    transform="matrix(-1,-1.22465e-16,1.22465e-16,-1,61.9767,61.9767)">
                                    <a
                                        class="step inner"
                                        @click="
                                            doSendMove(
                                                `X${!reverseX ? '-' : '+'}${stepsXY.length >= 0 ? stepsXY[0] : 0}`,
                                                feedrateXY
                                            )
                                        ">
                                        <g transform="matrix(0.48,0,0,0.48,19,19)">
                                            <path :d="xyStepInner" />
                                        </g>
                                    </a>
                                    <a
                                        class="step inner-mid"
                                        @click="
                                            doSendMove(
                                                `X${!reverseX ? '-' : '+'}${stepsXY.length >= 1 ? stepsXY[1] : 0}`,
                                                feedrateXY
                                            )
                                        ">
                                        <g transform="matrix(0.72,0,0,0.72,13,13)">
                                            <path :d="xyStepInnerMid" />
                                        </g>
                                    </a>
                                    <a
                                        class="step outer-mid"
                                        @click="
                                            doSendMove(
                                                `X${!reverseX ? '-' : '+'}${stepsXY.length >= 2 ? stepsXY[2] : 0}`,
                                                feedrateXY
                                            )
                                        ">
                                        <g transform="matrix(0.96,0,0,0.96,7,7)">
                                            <path :d="xyStepOuterMid" />
                                        </g>
                                    </a>
                                    <a
                                        class="step outer"
                                        @click="
                                            doSendMove(
                                                `X${!reverseX ? '-' : '+'}${stepsXY.length >= 3 ? stepsXY[3] : 0}`,
                                                feedrateXY
                                            )
                                        ">
                                        <g transform="matrix(1.2,0,0,1.2,1,1)">
                                            <path :d="xyStepOuter" />
                                        </g>
                                    </a>
                                </g>
                                <g
                                    id="Bottom1"
                                    :class="yStepClass"
                                    transform="matrix(6.12323e-17,1,-1,6.12323e-17,61.9767,-1.77705e-14)">
                                    <a
                                        class="step inner"
                                        @click="
                                            doSendMove(
                                                `Y${!reverseY ? '-' : '+'}${stepsXY.length >= 0 ? stepsXY[0] : 0}`,
                                                feedrateXY
                                            )
                                        ">
                                        <g transform="matrix(0.48,0,0,0.48,19,19)">
                                            <path :d="xyStepInner" />
                                        </g>
                                    </a>
                                    <a
                                        class="step inner-mid"
                                        @click="
                                            doSendMove(
                                                `Y${!reverseY ? '-' : '+'}${stepsXY.length >= 1 ? stepsXY[1] : 0}`,
                                                feedrateXY
                                            )
                                        ">
                                        <g transform="matrix(0.72,0,0,0.72,13,13)">
                                            <path :d="xyStepInnerMid" />
                                        </g>
                                    </a>
                                    <a
                                        class="step outer-mid"
                                        @click="
                                            doSendMove(
                                                `Y${!reverseY ? '-' : '+'}${stepsXY.length >= 2 ? stepsXY[2] : 0}`,
                                                feedrateXY
                                            )
                                        ">
                                        <g transform="matrix(0.96,0,0,0.96,7,7)">
                                            <path :d="xyStepOuterMid" />
                                        </g>
                                    </a>
                                    <a
                                        class="step outer"
                                        @click="
                                            doSendMove(
                                                `Y${!reverseY ? '-' : '+'}${stepsXY.length >= 3 ? stepsXY[3] : 0}`,
                                                feedrateXY
                                            )
                                        ">
                                        <g transform="matrix(1.2,0,0,1.2,1,1)">
                                            <path :d="xyStepOuter" />
                                        </g>
                                    </a>
                                </g>
                                <g
                                    id="Top1"
                                    :class="yStepClass"
                                    transform="matrix(6.12323e-17,-1,1,6.12323e-17,7.10543e-15,61.9767)">
                                    <a
                                        class="step inner"
                                        @click="
                                            doSendMove(
                                                `Y${reverseY ? '-' : '+'}${stepsXY.length >= 0 ? stepsXY[0] : 0}`,
                                                feedrateXY
                                            )
                                        ">
                                        <g transform="matrix(0.48,0,0,0.48,19,19)">
                                            <path :d="xyStepInner" />
                                        </g>
                                    </a>
                                    <a
                                        class="step inner-mid"
                                        @click="
                                            doSendMove(
                                                `Y${reverseY ? '-' : '+'}${stepsXY.length >= 1 ? stepsXY[1] : 0}`,
                                                feedrateXY
                                            )
                                        ">
                                        <g transform="matrix(0.72,0,0,0.72,13,13)">
                                            <path :d="xyStepInnerMid" />
                                        </g>
                                    </a>
                                    <a
                                        class="step outer-mid"
                                        @click="
                                            doSendMove(
                                                `Y${reverseY ? '-' : '+'}${stepsXY.length >= 2 ? stepsXY[2] : 0}`,
                                                feedrateXY
                                            )
                                        ">
                                        <g transform="matrix(0.96,0,0,0.96,7,7)">
                                            <path :d="xyStepOuterMid" />
                                        </g>
                                    </a>
                                    <a
                                        class="step outer"
                                        @click="
                                            doSendMove(
                                                `Y${reverseY ? '-' : '+'}${stepsXY.length >= 3 ? stepsXY[3] : 0}`,
                                                feedrateXY
                                            )
                                        ">
                                        <g transform="matrix(1.2,0,0,1.2,1,1)">
                                            <path :d="xyStepOuter" />
                                        </g>
                                    </a>
                                </g>
                            </g>
                            <!-- XY STEP BUTTON TEXT -->
                            <g id="stepsXY" :class="stepTextClass">
                                <g transform="matrix(1,0,0,1,0.483899,4.07983)">
                                    <text x="30.5px" y="19.056px" text-anchor="middle">
                                        {{ stepsXY.length >= 0 ? stepsXY[0] : '--' }}
                                    </text>
                                </g>
                                <g transform="matrix(1,0,0,1,0.220227,-1.95729)">
                                    <text x="30.5px" y="19.056px" text-anchor="middle">
                                        {{ stepsXY.length >= 1 ? stepsXY[1] : '--' }}
                                    </text>
                                </g>
                                <g transform="matrix(1,0,0,1,0.220227,-7.99441)">
                                    <text x="30.5px" y="19.056px" text-anchor="middle">
                                        {{ stepsXY.length >= 2 ? stepsXY[2] : '--' }}
                                    </text>
                                </g>
                                <g transform="matrix(1,0,0,1,0.220227,-14.0315)">
                                    <text x="30.5px" y="19.056px" text-anchor="middle">
                                        {{ stepsXY.length >= 3 ? stepsXY[3] : '--' }}
                                    </text>
                                </g>
                            </g>
                        </g>
                    </g>
                    <a
                        v-if="existsQGL && actionButton === 'qgl'"
                        id="tilt_adjust"
                        :class="colorSpecialButton"
                        @click="clickSpecialButton">
                        <circle id="qgl_button" cx="70.92" cy="31" r="5" />
                        <text x="66.776px" y="32.066px">QGL</text>
                        <g id="tilt_icon">
                            <path :d="zTiltIcon1" />
                            <path :d="zTiltIcon2" />
                        </g>
                    </a>
                    <a
                        v-else-if="existsZtilt && actionButton === 'ztilt'"
                        id="tilt_adjust"
                        :class="colorSpecialButton"
                        @click="clickSpecialButton">
                        <circle id="tilt_button" cx="70.92" cy="31" r="5" />
                        <text x="66.776px" y="32.066px">Z-TILT</text>
                        <g id="tilt_icon">
                            <path :d="zTiltIcon1" />
                            <path :d="zTiltIcon2" />
                        </g>
                    </a>
                    <a v-else id="stepper_off" :class="motorsOffClass" @click="doSend('M84')">
                        <circle id="stepper_off_button" cx="70.92" cy="31" r="5" />
                        <g id="stepper_off_icon" transform="scale(0.3) translate(224,91)">
                            <path :d="engineOffIcon" />
                        </g>
                    </a>
                </svg>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'

@Component
export default class CircleControl extends Mixins(BaseMixin, ControlMixin) {
    /**
     * SVG paths for home buttons
     */
    homeIcon = 'M10,20L10,14L14,14L14,20L19,20L19,12L22,12L12,3L2,12L5,12L5,20L10,20Z'
    pathHomeButtonTop =
        'M9.188,-0C9.634,0.001 10.028,0.291 10.162,0.717C10.295,1.142 10.136,1.605 9.77,1.86C6.722,4.035 4.05,6.701 1.869,9.743C1.614,10.11 1.151,10.269 0.724,10.135C0.298,10.002 0.008,9.607 0.008,9.16C0,6.418 0,2.781 0,1.029C-0,0.756 0.108,0.495 0.302,0.302C0.495,0.108 0.756,-0 1.029,0L9.188,-0Z'
    pathHomeButtonBottom =
        'M9.188,0C9.634,0.001 10.028,0.291 10.162,0.717C10.295,1.142 10.136,1.605 9.77,1.86C6.722,4.035 4.05,6.701 1.869,9.743C1.614,10.11 1.151,10.269 0.724,10.135C0.298,10.002 0.008,9.607 0.008,9.16C0,6.418 0,2.781 0,1.029C-0,0.756 0.108,0.495 0.302,0.302C0.495,0.108 0.756,-0 1.029,0L9.188,0Z'
    /**
     * SVG paths for XY steps
     */
    xyStepOuter =
        'M43.181,8.535C43.262,8.453 43.373,8.409 43.488,8.412C43.602,8.415 43.711,8.466 43.787,8.551C47.661,12.933 50,18.695 50,25C50,31.291 47.672,37.042 43.811,41.42C43.735,41.505 43.627,41.556 43.512,41.559C43.398,41.562 43.287,41.518 43.206,41.437C42.343,40.575 39.981,38.213 39.981,38.213C43.11,34.7 45,30.069 45,25C45,19.918 43.1,15.276 39.956,11.759C39.956,11.759 42.319,9.397 43.181,8.535Z'
    xyStepOuterMid =
        'M47.418,4.777C57.663,18.688 57.829,31.029 47.304,45.072L39.308,37.098C42.081,33.838 43.75,29.612 43.75,25C43.75,20.371 42.069,16.132 39.277,12.868L47.418,4.777Z'
    xyStepInnerMid =
        'M54.897,-1.964C68.991,16.277 68.542,32.764 54.738,51.763L44.077,41.131L38.115,35.169C40.361,32.389 41.667,28.846 41.667,25C41.667,21.132 40.346,17.57 38.076,14.784L54.897,-1.964Z'
    xyStepInner =
        'M36.096,19.243C35.88,18.839 35.954,18.342 36.278,18.019C40.686,13.619 69.84,-15.445 69.84,-15.445C90.891,13.786 89.845,38.467 69.564,65.144C69.564,65.144 40.684,36.265 36.318,31.899C35.996,31.576 35.922,31.081 36.134,30.678C37.008,28.975 37.5,27.044 37.5,25C37.5,22.925 36.993,20.967 36.096,19.243Z'
    /**
     * SVG paths for Z steps
     */
    zStepOuter =
        'M66.037,2.5C66.037,1.672 66.709,1 67.537,1L74.537,1C75.365,1 76.037,1.672 76.037,2.5L76.037,7.521C74.428,7.179 72.759,7 71.048,7C69.33,7 67.654,7.181 66.037,7.525L66.037,2.5Z'
    zStepOuterMid =
        'M66.037,7.221C69.367,6.597 72.7,6.583 76.037,7.192L76.037,13.702C74.453,13.245 72.778,13 71.048,13C69.309,13 67.627,13.247 66.037,13.708L66.037,7.221Z'
    zStepInnerMid =
        'M66.037,13.244C69.353,12.66 72.687,12.7 76.037,13.355L76.037,20.099C74.523,19.39 72.831,19 71.048,19C69.256,19 67.556,19.393 66.037,20.109L66.037,13.244Z'
    zStepInner =
        'M66.037,19.186C69.409,18.542 72.742,18.52 76.037,19.102L76.037,23.682C76.037,23.815 75.984,23.942 75.891,24.036C75.564,24.362 74.774,25.153 74.359,25.567C74.204,25.722 73.967,25.757 73.773,25.656C72.955,25.236 72.029,25 71.048,25C70.051,25 69.112,25.243 68.284,25.674C68.09,25.777 67.852,25.742 67.697,25.586C67.283,25.175 66.506,24.395 66.183,24.071C66.09,23.977 66.037,23.85 66.037,23.718C66.037,22.806 66.037,19.186 66.037,19.186Z'
    /**
     * SVG path for Z Tilt icon
     */
    zTiltIcon1 = 'M74.189,31.503L67.751,30.009L67.638,30.496L74.076,31.99L74.189,31.503Z'
    zTiltIcon2 =
        'M74.361,32.85L74.034,32.676L74.939,32.188L75.039,33.211L74.745,33.055C74.386,33.724 73.858,34.288 73.213,34.69L72.983,34.321C73.563,33.959 74.038,33.452 74.361,32.85ZM67.193,28.75C67.586,28.1 68.142,27.564 68.807,27.196L69.018,27.576C68.42,27.907 67.919,28.389 67.565,28.974L67.883,29.165L66.954,29.605L66.907,28.578L67.193,28.75Z'
    /**
     * SVG path for engine off icon
     */
    engineOffIcon =
        'M3.78 2.5L21.5 20.22l-1.27 1.28L18 19.27V20h-8l-2-2H5v-3H3v3H1v-8h2v3h2v-3l1.87-1.86L2.5 3.77L3.78 2.5M20 9v3h-2V8h-6V6h3V4H7.82l15 15H23V9h-3Z'

    get actionButton(): string {
        return this.$store.state.gui.control.actionButton ?? this.defaultActionButton
    }

    get enableXYHoming(): boolean {
        return this.$store.state.gui.control.enableXYHoming
    }

    get reverseX() {
        return this.$store.state.gui.control.reverseX
    }

    get reverseY() {
        return this.$store.state.gui.control.reverseY
    }

    get reverseZ() {
        return this.$store.state.gui.control.reverseZ
    }

    get stepsXY() {
        const steps = this.$store.state.gui.control?.stepsCircleXY ?? []

        return Array.from(new Set([...(steps ?? [])])).sort((a, b) => a - b)
    }

    get stepsZ() {
        const steps = this.$store.state.gui.control?.stepsCircleZ ?? []

        return Array.from(new Set([...(steps ?? [])])).sort((a, b) => a - b)
    }

    get isPrinting() {
        return ['printing'].includes(this.printer_state)
    }

    get stepTextClass() {
        if (!this.homedAxes.includes('xy') || this.isPrinting) return ['disabled']

        return []
    }

    get xStepClass() {
        if (!this.homedAxes.includes('x') || this.isPrinting) return ['disabled']

        return []
    }

    get yStepClass() {
        if (!this.homedAxes.includes('y') || this.isPrinting) return ['disabled']

        return []
    }

    get zStepClass() {
        if (!this.homedAxes.includes('z') || this.isPrinting) return ['disabled']

        return []
    }

    get xHomeClass() {
        let classes = []
        if (this.homedAxes.includes('x')) classes.push('homed')
        if (this.isPrinting) classes.push('disabled')

        return classes
    }

    get yHomeClass() {
        let classes = []
        if (this.homedAxes.includes('y')) classes.push('homed')
        if (this.isPrinting) classes.push('disabled')

        return classes
    }

    get xyHomeClass() {
        let classes = []
        if (this.homedAxes.includes('xy')) classes.push('homed')
        if (this.isPrinting) classes.push('disabled')

        return classes
    }

    get xyzHomeClass() {
        let classes = []
        if (this.homedAxes.includes('xyz')) classes.push('homed')
        if (this.isPrinting) classes.push('disabled')

        return classes
    }

    get zHomeClass() {
        let classes = []
        if (this.homedAxes.includes('z')) classes.push('homed')
        if (this.isPrinting) classes.push('disabled')

        return classes
    }

    get colorSpecialButton() {
        let classes = []
        if (this.isPrinting) classes.push('disabled')
        if (this.existsQGL) classes.push(this.colorQuadGantryLevel)
        else if (this.existsZtilt) classes.push(this.colorZTilt)

        return classes
    }

    get motorsOffClass() {
        let classes = []
        classes.push(this.homedAxes !== '' ? 'primary' : 'warning')
        if (this.isPrinting) classes.push('disabled')

        return classes
    }

    clickSpecialButton() {
        if (this.existsQGL) this.doQGL()
        else if (this.existsZtilt) return this.doZtilt()
    }
}
</script>

<style scoped>
svg {
    max-height: 350px;
    min-height: 275px;
    user-select: none;
    filter: drop-shadow(0px 10px 10px rgba(0, 0, 0, 0.3));
}

svg a {
    stroke: hsl(0, 0%, 10%);
    stroke-width: 0.3px;
}

svg a.step {
    transition: fill 750ms ease-out;
}

svg a.step:hover {
    fill: hsl(215, 0%, 50%) !important;
    transition: fill 100ms ease-in;
}

svg a.step:active {
    fill: hsl(215, 0%, 70%) !important;
}

svg a.step.inner {
    fill: #666;
}
svg a.step.inner-mid {
    fill: #555;
}
svg a.step.outer-mid {
    fill: #444;
}
svg a.step.outer {
    fill: #333;
}

html.theme--light svg a.step.inner {
    fill: #ccc;
}

html.theme--light svg a.step.inner-mid {
    fill: #ddd;
}

html.theme--light svg a.step.outer-mid {
    fill: #eee;
}

html.theme--light svg a.step.outer {
    fill: #fff;
}

svg .disabled a.step {
    pointer-events: none;
}

svg g#stepsZ,
svg g#stepsXY {
    pointer-events: none;
    user-select: none;
    font-family: 'Roboto-Regular', 'Roboto', sans-serif;
    font-size: 3px;
    fill: white;
}

html.theme--light svg g#stepsZ,
html.theme--light svg g#stepsXY {
    fill: black;
}

svg a#tilt_adjust text {
    font-family: 'Roboto-Regular', 'Roboto', sans-serif;
    font-size: 3px;
    display: none;
}

svg g#home_buttons text {
    font-family: 'Roboto-Regular', 'Roboto', sans-serif;
    font-size: 5px;
    fill: black;
}

svg g.home_button,
svg a#home_all_center {
    fill: var(--color-warning);
    transition: opacity 250ms;
}

svg a.disabled {
    pointer-events: none;
}

svg a.disabled .home_button path,
svg a.disabled circle {
    fill: rgb(92, 92, 92);
}

svg g#stepsXY.disabled text,
svg g#stepsZ.disabled text {
    fill: rgba(255, 255, 255, 0.3);
}

html.theme--light svg g#stepsXY.disabled text,
html.theme--light svg g#stepsZ.disabled text {
    fill: rgba(0, 0, 0, 0.5);
}

svg a#tilt_adjust,
svg a#stepper_off {
    transition: opacity 250ms;
}

svg a#tilt_adjust.warning,
svg a#stepper_off.warning {
    fill: var(--color-warning);
}

svg a#tilt_adjust.primary,
svg a#stepper_off.primary {
    fill: var(--color-primary);
}

svg .homed g.home_button,
svg .homed a#home_all_center {
    fill: var(--color-primary);
}

svg g.home_button:hover,
svg a#home_all_center:hover,
svg a#tilt_adjust:hover,
svg a#stepper_off:hover {
    opacity: 0.8;
}

svg a#tilt_adjust text,
svg a#tilt_adjust #tilt_icon,
svg a#stepper_off #stepper_off_icon,
svg g#home_buttons .home_icon {
    pointer-events: none;
    user-select: none;
}

svg a#tilt_adjust #tilt_icon,
svg a#stepper_off #stepper_off_icon {
    fill: #000;
}
</style>
