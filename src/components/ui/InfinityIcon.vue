<template>
    <svg
        height="20px"
        width="20px"
        style="float: right; margin-top: 2px; margin-left: 5px"
        viewBox="0 0 60 60"
        xml:space="preserve">
        <path
            :style="infColorStyle"
            d="M43.594,12.5c-9.046,0-16.406,7.851-16.406,17.5c0,6.341-4.836,11.5-10.781,11.5S5.625,36.341,5.625,30
      s4.836-11.5,10.781-11.5c2.146,0,4.218,0.67,5.992,1.938c0.593,0.425,1.147,0.911,1.645,1.445c1.061,1.136,2.914,1.14,3.977,0.009
      c1.099-1.167,1.103-3.07,0.009-4.243c-0.76-0.813-1.601-1.552-2.499-2.194c-2.704-1.933-5.858-2.954-9.124-2.954
      C7.36,12.5,0,20.351,0,30s7.36,17.5,16.406,17.5S32.812,39.649,32.812,30c0-6.341,4.836-11.5,10.781-11.5S54.375,23.659,54.375,30
      s-4.836,11.5-10.781,11.5c-2.879,0-5.586-1.195-7.622-3.366c-1.062-1.133-2.915-1.133-3.978,0c-0.531,0.567-0.823,1.32-0.823,2.121
      c0,0.802,0.293,1.556,0.824,2.121c3.098,3.305,7.218,5.124,11.599,5.124C52.64,47.5,60,39.649,60,30S52.64,12.5,43.594,12.5z" />
    </svg>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class InfinityIcon extends Vue {
    // Optional color prop with a default value of green
    @Prop({ required: false, default: '#000000' }) readonly color!: string

    // Computed property to generate dynamic styles
    get infColorStyle() {
        return { fill: this.color }
    }
}
</script>
<style scoped></style>
