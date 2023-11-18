<template>
    <span>
        <span v-for="({ directoryName, location }, index) in pathSegments" :key="location" class="navigation-container">
            <template v-if="index !== 0">
                <span class="navigation-divider text--disabled">{{ segmentSeparator }}</span>
            </template>
            <span
                class="cursor-pointer navigation-segment"
                tabindex="0"
                role="button"
                @click="onSegmentClick({ location })"
                @keyup.enter="onSegmentClick({ location })">
                <template v-if="directoryName">{{ directoryName }}</template>
                <template v-else>
                    <slot name="rootElement">
                        <v-icon small>
                            {{ mdiHome }}
                        </v-icon>
                    </slot>
                </template>
            </span>
        </span>
    </span>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiHome } from '@mdi/js'

interface pathSegment {
    directoryName: string
    location: string
}

@Component
export default class PathNavigation extends Mixins(BaseMixin) {
    @Prop({ default: false }) declare readonly path: string
    @Prop({ default: false }) declare readonly onSegmentClick: (segment: { location: string }) => void

    private readonly segmentSeparator = '/'

    mdiHome = mdiHome

    get pathSegments(): pathSegment[] {
        const [firstSegment, ...restOfSegments] = (this.path || '').split(this.segmentSeparator)

        const firstPathSegment = {
            directoryName: firstSegment,
            location: firstSegment,
        }

        return restOfSegments.reduce(
            (allSegments: pathSegment[], currentSegment: string) => {
                const previousSegmentLocation = allSegments[allSegments.length - 1].location
                const location = `${previousSegmentLocation}${this.segmentSeparator}${currentSegment}`

                const newPathSegment = {
                    directoryName: currentSegment,
                    location,
                }

                allSegments.push(newPathSegment)

                return allSegments
            },
            [firstPathSegment]
        )
    }
}
</script>

<style scoped>
.navigation-divider {
    padding: 0 2px;
}
.navigation-segment:hover {
    text-decoration: underline;
}
.navigation-container:last-child {
    font-weight: bold;
}
</style>
