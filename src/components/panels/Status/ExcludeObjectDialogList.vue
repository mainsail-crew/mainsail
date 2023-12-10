<style scoped></style>

<template>
    <div>
        <template v-for="object in printing_objects">
            <v-row
                :key="'div_' + object.name"
                class="py-3 d-flex"
                @click="mouseOverObject(object.name)"
                @mouseover="mouseOverObject(object.name)"
                @mouseleave="mouseOverObject('')">
                <v-col
                    :class="
                        'py-2 subtitle-2 text-truncate ' +
                        (hoverName === object.name ? 'text--white' : 'text--disabled')
                    ">
                    {{ object.name }}
                </v-col>
                <v-col class="col-auto py-2">
                    <v-chip v-if="excluded_objects.includes(object.name)" pill small class="text--disabled">
                        {{ $t('Panels.StatusPanel.ExcludeObject.Excluded') }}
                    </v-chip>
                    <v-icon
                        v-else
                        class="text--disabled cursor-pointer"
                        small
                        @click="openExcludeObjectDialog(object.name)">
                        {{ mdiCloseCircle }}
                    </v-icon>
                </v-col>
            </v-row>
            <v-divider :key="'divider_' + object.name"></v-divider>
        </template>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiCloseCircle } from '@mdi/js'

@Component
export default class StatusPanelObjectsDialogList extends Mixins(BaseMixin) {
    mdiCloseCircle = mdiCloseCircle

    @Prop({ required: false, default: '' }) declare readonly hoverName: string

    get printing_objects() {
        return this.$store.state.printer.exclude_object?.objects ?? []
    }

    get current_object() {
        return this.$store.state.printer.exclude_object?.current_object ?? null
    }

    get excluded_objects() {
        return this.$store.state.printer.exclude_object?.excluded_objects ?? []
    }

    openExcludeObjectDialog(name: string) {
        this.$emit('update:name', name)
        this.$emit('update:bool', true)
    }

    mouseOverObject(name: string) {
        this.$emit('update:hoverName', name)
    }
}
</script>
