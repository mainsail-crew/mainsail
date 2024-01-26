<template>
    <div style="position: relative">
        <div id="tooltipObjectMap" ref="tooltipObjectMap" />
        <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            :viewBox="viewBox"
            xml:space="preserve">
            <defs>
                <marker id="arrowhead" markerWidth="5" markerHeight="4" refX="2" refY="2" orient="auto">
                    <polygon points="0 0, 5 2, 0 4" :fill="coordinationCrossColor" />
                </marker>
            </defs>
            <line
                :x1="convertX(0)"
                :y1="convertY(1)"
                :x2="convertX(stepperXmax / 4)"
                :y2="convertY(1)"
                :stroke="coordinationCrossColor"
                stroke-width="2"
                marker-end="url(#arrowhead)" />
            <line
                :x1="convertX(1)"
                :y1="convertY(0)"
                :x2="convertX(1)"
                :y2="convertY(stepperYmax / 4)"
                :stroke="coordinationCrossColor"
                stroke-width="2"
                marker-end="url(#arrowhead)" />
            <g>
                <line
                    v-for="x in xStripes"
                    :key="'xLines' + x"
                    :x1="convertX(x)"
                    :x2="convertX(x)"
                    :y1="convertY(stepperYmin)"
                    :y2="convertY(stepperYmax)"
                    :stroke="coordinationCrossColor"
                    :stroke-opacity="0.25"
                    stroke-width="1" />
                <line
                    v-for="y in yStripes"
                    :key="'yLines' + y"
                    :x1="convertX(stepperXmin)"
                    :x2="convertX(stepperXmax)"
                    :y1="convertY(y)"
                    :y2="convertY(y)"
                    :stroke="coordinationCrossColor"
                    :stroke-opacity="0.25"
                    stroke-width="1" />
            </g>

            <g v-for="(object, index) in printing_objects_with_polygons" :key="index">
                <polygon
                    :points="object.polygon.map((point) => convertX(point[0]) + ',' + convertY(point[1])).join(' ')"
                    style="cursor: pointer"
                    :stroke="current_object === object.name ? primaryColor : '#666'"
                    stroke-width="2"
                    fill-rule="evenodd"
                    :fill="
                        hoverName === object.name
                            ? primaryColor
                            : excluded_objects.includes(object.name)
                            ? '#6668'
                            : '#bbb'
                    "
                    @mouseover="showObjectTooltip(object.name)"
                    @mouseout="hideObjectTooltip"
                    @click="openExcludeObjectDialog(object.name)" />
            </g>
        </svg>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { defaultPrimaryColor } from '@/store/variables'

@Component
export default class StatusPanelObjectsDialogMap extends Mixins(BaseMixin) {
    private coordinationCrossColor = '#888'
    private stripesOffset = 50

    @Prop({ required: false, default: '' }) declare readonly hoverName: string

    declare $refs: {
        tooltipObjectMap: HTMLDivElement
    }

    get printing_objects() {
        return (
            (this.$store.state.printer.exclude_object?.objects ?? [])
                .map((object: any) => {
                    let total = 0

                    if ('polygon' in object) {
                        for (let i = 0; i < object.polygon.length; i++) {
                            const pointA = object.polygon[i]
                            const pointB = i === object.polygon.length - 1 ? object.polygon[0] : object.polygon[i + 1]

                            total += pointA[0] * pointB[1] - pointA[1] * pointB[0]
                        }
                    }

                    return {
                        center: object.center,
                        name: object.name,
                        polygon: object.polygon,
                        size: Math.abs(total),
                    }
                })
                // sort all objects by size
                .sort((a: any, b: any) => b.size - a.size)
        )
    }

    get printing_objects_with_polygons() {
        return this.printing_objects.filter((object: any) => 'polygon' in object)
    }

    get current_object() {
        return this.$store.state.printer.exclude_object?.current_object ?? null
    }

    get excluded_objects() {
        return this.$store.state.printer.exclude_object?.excluded_objects ?? []
    }

    get viewBox() {
        return (
            this.convertX(this.stepperXmin) +
            ' ' +
            this.convertY(this.stepperYmax) +
            ' ' +
            this.absoluteX +
            ' ' +
            this.absoluteY
        )
    }

    get toolhead() {
        return this.$store.state.printer.toolhead ?? {}
    }

    get axis_minimum() {
        return this.toolhead.axis_minimum ?? []
    }

    get axis_maximum() {
        return this.toolhead.axis_maximum ?? []
    }

    get stepperXmin() {
        return this.axis_minimum[0] ?? 0
    }

    get stepperXmax() {
        return this.axis_maximum[0] ?? 200
    }

    get stepperYmin() {
        return this.axis_minimum[1] ?? 0
    }

    get stepperYmax() {
        return this.axis_maximum[1] ?? 200
    }

    get absoluteX() {
        return Math.abs(this.stepperXmin) + Math.abs(this.stepperXmax)
    }

    get absoluteY() {
        return Math.abs(this.stepperYmin) + Math.abs(this.stepperYmax)
    }

    get xStripes() {
        const output = []
        const minXstripe = Math.floor(this.stepperXmin / this.stripesOffset) * this.stripesOffset
        const maxXstripe = Math.floor(this.stepperXmax / this.stripesOffset) * this.stripesOffset

        for (let i = minXstripe; i <= maxXstripe; i = i + this.stripesOffset) {
            output.push(i)
        }

        return output
    }

    get yStripes() {
        const output = []
        const minYstripe = Math.floor(this.stepperYmin / this.stripesOffset) * this.stripesOffset
        const maxYstripe = Math.floor(this.stepperYmax / this.stripesOffset) * this.stripesOffset

        for (let i = minYstripe; i <= maxYstripe; i = i + this.stripesOffset) {
            output.push(i)
        }

        return output
    }

    get primaryColor() {
        return this.$store.state.gui.theme?.primary ?? defaultPrimaryColor
    }

    convertX(x: number) {
        return x
    }

    convertY(y: number) {
        return y * -1
    }

    showObjectTooltip(text: string) {
        if (!this.$refs.tooltipObjectMap) return

        this.$refs.tooltipObjectMap.innerHTML = text
        this.$refs.tooltipObjectMap.style.display = 'block'

        window.addEventListener('mousemove', this.moveTooltip)
    }

    hideObjectTooltip() {
        if (!this.$refs.tooltipObjectMap) return

        this.$refs.tooltipObjectMap.style.display = 'none'

        window.removeEventListener('mousemove', this.moveTooltip)
    }

    moveTooltip(event: MouseEvent) {
        if (!this.$refs.tooltipObjectMap) return

        const top = event.offsetY - this.$refs.tooltipObjectMap.clientHeight - 15
        this.$refs.tooltipObjectMap.style.left = `${event.offsetX - 20}px`
        this.$refs.tooltipObjectMap.style.top = `${top}px`
    }

    openExcludeObjectDialog(name: string) {
        this.$emit('update:name', name)
        this.$emit('update:bool', true)
    }
}
</script>

<style scoped>
svg {
    border: 2px solid #888;
}

#tooltipObjectMap {
    display: none;
    position: absolute;
    background: black;
    border-radius: 3px;
    color: white;
    padding: 3px 7px;
    z-index: 100;

    &:before {
        display: block;
        content: ' ';
        width: 0;
        height: 0;
        position: absolute;
        bottom: -10px;
        left: 10px;
        border-top: 10px solid black;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
    }
}
</style>
