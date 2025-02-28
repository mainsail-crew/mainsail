<template>
    <div class="color-box-container" :class="{ disabled: isDisabled }">
        <div v-if="color" class="color-box" :style="{ backgroundColor: color }"></div>
        <small v-if="weight" class="weight" :class="{ disabled: isDisabled }">{{ weight }}</small>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class ColorBox extends Vue {
    @Prop({ required: true }) color!: string
    @Prop({ required: false }) weight?: string

    get isDisabled() {
        return this.weight === '0 g'
    }
}
</script>

<style scoped>
.color-box-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 10px;
}

.color-box {
    width: 25px;
    height: 25px;
    border: 2px solid #000;
    border-radius: 5px;
    display: inline-block;
}

.weight {
    margin-top: 5px;
    min-width: 40px;
    text-align: center;
    white-space: nowrap;
}

.disabled .color-box {
    opacity: 0.1;
}

.theme--dark .disabled .weight {
    color: rgba(255, 255, 255, 0.5);
}

.theme--light .disabled .weight {
    color: rgba(0, 0, 0, 0.38);
}
</style>
