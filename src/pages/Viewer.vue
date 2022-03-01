<template>
    <viewer></viewer>
</template>

<script lang="ts">
import Viewer from '@/components/gcodeviewer/Viewer.vue'
import BaseMixin from '@/components/mixins/base'
import { Component, Mixins } from 'vue-property-decorator'

@Component({
    components: { Viewer },
})
export default class PageGCodeViewer extends Mixins(BaseMixin) {}
</script>
