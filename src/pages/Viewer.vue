<template>
	<viewer></viewer>
</template>

<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import {Component, Mixins} from 'vue-property-decorator'
import Viewer from '@/components/gcodeviewer/Viewer.vue'

@Component({
    components: {Viewer},
})
export default class PageGCodeViewer extends Mixins(BaseMixin) {}
</script>