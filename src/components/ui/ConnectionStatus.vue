<template>
    <svg
        width="100%"
        height="100%"
        viewBox="0 0 430 70"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xml:space="preserve"
        xmlns:serif="http://www.serif.com/"
        style="fill-rule: evenodd; clip-rule: evenodd; stroke-linejoin: round; stroke-miterlimit: 2">
        <g id="Mainsail" transform="matrix(1,0,0,1,10,0)">
            <g id="Mainsail_text" transform="matrix(1,0,0,1,-54.2745,6.1424)">
                <text
                    x="47.429px"
                    y="60.749px"
                    :style="'font-family:Roboto;font-size:16px;fill:rgb(' + colorMainsail + ');'">
                    Mainsail
                </text>
            </g>
            <g id="Mainsail_icon" transform="matrix(1.00478,0,0,1.00478,-1.35436,-0.18202)">
                <g transform="matrix(0.101469,0,0,0.101469,1.34792,1.1764)">
                    <path
                        d="M286.718,107.235L99.735,392.115L0,392.01L258.225,0C264.135,36.795 273.9,73.26 286.718,107.235"
                        :style="'fill:rgb(' + colorMainsail + ');fill-rule:nonzero;'" />
                </g>
                <g transform="matrix(0.101469,0,0,0.101469,1.34792,1.1764)">
                    <path
                        d="M309.96,160.155L156.375,392.19L256.08,392.332L357.353,237.585C339.518,213.218 323.648,187.328 309.96,160.155"
                        :style="'fill:rgb(' + colorMainsail + ');fill-rule:nonzero;'" />
                </g>
                <g transform="matrix(0.101469,0,0,0.101469,1.34792,1.1764)">
                    <path
                        d="M449.535,335.768L412.597,392.332L312.75,392.115L388.95,276.862C407.61,298.012 427.868,317.707 449.535,335.767L449.535,335.768Z"
                        :style="'fill:rgb(' + colorMainsail + ');fill-rule:nonzero;'" />
                </g>
            </g>
        </g>
        <g id="Mainsail_Moonraker" transform="matrix(1,0,0,1,1.49628,0)">
            <g id="arrow_left1" serif:id="arrow_left" transform="matrix(0.687874,0,0,0.721154,20.3568,-15.8811)">
                <path
                    d="M93.918,56.626L93.918,60.724L73.299,52.528L93.918,44.333L93.918,48.431L118.741,48.431L118.741,56.626L93.918,56.626Z"
                    :style="'fill:rgb(' + colorMoonraker + ')'" />
            </g>
            <g
                id="arrow_right1"
                serif:id="arrow_right"
                transform="matrix(-0.687874,-8.42403e-17,8.83159e-17,-0.721154,217.125,59.8811)">
                <path
                    d="M93.918,56.626L93.918,60.724L73.299,52.528L93.918,44.333L93.918,48.431L118.741,48.431L118.741,56.626L93.918,56.626Z"
                    :style="'fill:rgb(' + colorMoonraker + ')'" />
            </g>
            <g v-if="moonraker" id="success1" serif:id="success" transform="matrix(1.1,0,0,1.1,105.541,9.8)">
                <path
                    d="M20,12C20,16.389 16.389,20 12,20C7.611,20 4,16.389 4,12C4,7.611 7.611,4 12,4C12.76,4 13.5,4.11 14.2,4.31L15.77,2.74C14.61,2.26 13.34,2 12,2C6.514,2 2,6.514 2,12C2,17.486 6.514,22 12,22C17.486,22 22,17.486 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z"
                    style="fill: rgb(38, 203, 124); fill-rule: nonzero" />
            </g>
            <g v-else id="alert1" serif:id="alert" transform="matrix(1.1,0,0,1.1,105.541,9.8)">
                <path
                    d="M11,15L13,15L13,17L11,17L11,15M11,7L13,7L13,13L11,13L11,7M12,2C6.47,2 2,6.5 2,12C2,17.486 6.514,22 12,22C17.486,22 22,17.486 22,12C22,6.514 17.486,2 12,2M12,20C7.611,20 4,16.389 4,12C4,7.611 7.611,4 12,4C16.389,4 20,7.611 20,12C20,16.389 16.389,20 12,20Z"
                    style="fill: rgb(245, 124, 5); fill-rule: nonzero" />
            </g>
        </g>
        <g id="Moonraker" transform="matrix(1,0,0,1,10,0)">
            <g id="Moonraker_text" transform="matrix(1,0,0,1,120.368,6.1424)">
                <text
                    x="45.429px"
                    y="60.749px"
                    :style="'fill:rgb(' + colorMoonraker + ');font-family:Roboto;font-size:16px;'">
                    Moonraker
                </text>
            </g>
            <g id="Moonraker_icon" transform="matrix(2,0,0,2,181,-5)">
                <path
                    d="M13,19L14,19C14.549,19 15,19.451 15,20L22,20L22,22L15,22C15,22.549 14.549,23 14,23L10,23C9.451,23 9,22.549 9,22L2,22L2,20L9,20C9,19.451 9.451,19 10,19L11,19L11,17L4,17C3.451,17 3,16.549 3,16L3,12C3,11.451 3.451,11 4,11L20,11C20.549,11 21,11.451 21,12L21,16C21,16.549 20.549,17 20,17L13,17L13,19M4,3L20,3C20.549,3 21,3.451 21,4L21,8C21,8.549 20.549,9 20,9L4,9C3.451,9 3,8.549 3,8L3,4C3,3.451 3.451,3 4,3M9,7L10,7L10,5L9,5L9,7M9,15L10,15L10,13L9,13L9,15M5,5L5,7L7,7L7,5L5,5M5,13L5,15L7,15L7,13L5,13Z"
                    :style="'fill:rgb(' + colorMoonraker + ');fill-rule:nonzero;'" />
            </g>
        </g>
        <g id="Moonraker_Klipper" transform="matrix(1,0,0,1,194.593,0)">
            <g id="arrow_left" transform="matrix(0.687874,0,0,0.721154,20.3568,-15.8811)">
                <path
                    d="M93.918,56.626L93.918,60.724L73.299,52.528L93.918,44.333L93.918,48.431L118.741,48.431L118.741,56.626L93.918,56.626Z"
                    style="fill: rgb(115, 115, 115)" />
            </g>
            <g id="arrow_right" transform="matrix(-0.687874,-8.42403e-17,8.83159e-17,-0.721154,217.125,59.8811)">
                <path
                    d="M93.918,56.626L93.918,60.724L73.299,52.528L93.918,44.333L93.918,48.431L118.741,48.431L118.741,56.626L93.918,56.626Z"
                    style="fill: rgb(115, 115, 115)" />
            </g>
            <template v-if="moonraker">
                <g v-if="klipper" id="success" transform="matrix(1.1,0,0,1.1,105.541,9.8)">
                    <path
                        d="M20,12C20,16.389 16.389,20 12,20C7.611,20 4,16.389 4,12C4,7.611 7.611,4 12,4C12.76,4 13.5,4.11 14.2,4.31L15.77,2.74C14.61,2.26 13.34,2 12,2C6.514,2 2,6.514 2,12C2,17.486 6.514,22 12,22C17.486,22 22,17.486 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z"
                        style="fill: rgb(38, 203, 124); fill-rule: nonzero" />
                </g>
                <g v-else id="alert" transform="matrix(1.1,0,0,1.1,105.541,9.8)">
                    <path
                        d="M11,15L13,15L13,17L11,17L11,15M11,7L13,7L13,13L11,13L11,7M12,2C6.47,2 2,6.5 2,12C2,17.486 6.514,22 12,22C17.486,22 22,17.486 22,12C22,6.514 17.486,2 12,2M12,20C7.611,20 4,16.389 4,12C4,7.611 7.611,4 12,4C16.389,4 20,7.611 20,12C20,16.389 16.389,20 12,20Z"
                        style="fill: rgb(245, 124, 5); fill-rule: nonzero" />
                </g>
            </template>
            <template v-else>
                <g id="unknown" transform="matrix(1.1,0,0,1.1,105.541,9.8)">
                    <path
                        d="M11,18L13,18L13,16L11,16L11,18M12,2C6.514,2 2,6.514 2,12C2,17.486 6.514,22 12,22C17.486,22 22,17.486 22,12C22,6.514 17.486,2 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6C9.806,6 8,7.806 8,10L10,10C10,8.903 10.903,8 12,8C13.097,8 14,8.903 14,10C14,12 11,11.75 11,15L13,15C13,12.75 16,12.5 16,10C16,7.806 14.194,6 12,6Z"
                        style="fill: rgb(115, 115, 115); fill-rule: nonzero" />
                </g>
            </template>
        </g>
        <g id="Klipper" transform="matrix(1,0,0,1,10,0)">
            <g id="Klipper_text" transform="matrix(1,0,0,1,317.036,6.1424)">
                <text
                    x="48.429px"
                    y="60.749px"
                    :style="'font-family:Roboto;font-size:16px;fill:rgb(' + colorKlipper + ');'">
                    Klipper
                </text>
            </g>
            <g id="Klipper_icon" transform="matrix(2,0,0,2,366,-3)">
                <path
                    d="M19,6C19.549,6 20,5.549 20,5C20,4.451 19.549,4 19,4C18.451,4 18,4.451 18,5C18,5.549 18.451,6 19,6M19,2C20.646,2 22,3.354 22,5L22,11L18,11L18,7L6,7L6,11L2,11L2,5C2,3.354 3.354,2 5,2L19,2M18,18.25C18,18.63 17.79,18.96 17.47,19.13L12.57,21.82C12.4,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L6.53,19.13C6.21,18.96 6,18.63 6,18.25L6,13C6,12.62 6.21,12.29 6.53,12.12L11.43,9.68C11.59,9.56 11.79,9.5 12,9.5C12.21,9.5 12.4,9.56 12.57,9.68L17.47,12.12C17.79,12.29 18,12.62 18,13L18,18.25M12,11.65L9.04,13L12,14.6L14.96,13L12,11.65M8,17.66L11,19.29L11,16.33L8,14.71L8,17.66M16,17.66L16,14.71L13,16.33L13,19.29L16,17.66Z"
                    :style="'fill:rgb(' + colorKlipper + ');fill-rule:nonzero;'" />
            </g>
        </g>
    </svg>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class ConnectionStatus extends Mixins(BaseMixin) {
    @Prop({ default: false }) declare readonly moonraker: boolean | undefined
    @Prop({ default: false }) declare readonly klipper: boolean | undefined

    get colorMainsail() {
        return '200,200,200'
    }

    get colorMoonraker() {
        return this.moonraker ? '200,200,200' : '115,115,115'
    }

    get colorKlipper() {
        return this.klipper ? '200,200,200' : '115,115,115'
    }
}
</script>
