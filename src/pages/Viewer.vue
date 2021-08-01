<template>
	<v-card>
		<v-card-title>
			<v-icon>mdi-video-3d</v-icon>
			{{ $t('GCodeViewer.Title') }}
		</v-card-title>
		<v-card-text>
			<viewer></viewer>
		</v-card-text>
	</v-card>
</template>

<script lang="ts">
import BaseMixin from '@/components/mixins/base';
import {Component, Mixins} from 'vue-property-decorator';
import Viewer from '@/components/gcodeviewer/Viewer.vue';

@Component({
	components: {Viewer},
})
export default class PageGCodeViewer extends Mixins(BaseMixin) {}
</script>