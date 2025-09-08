<template>
    <tr
        :class="trClasses"
        @click="goBackAction"
        @dragenter.prevent="isHover = true"
        @dragleave.prevent="isHover = false"
        @drop="onDrop"
        @dragover="onDragOver">
        <td class="file-list__select-td pr-0">
            <v-simple-checkbox v-ripple disabled class="pa-0 mr-0" />
        </td>
        <td class="px-0 text-center" style="width: 32px">
            <v-icon>{{ mdiFolderUpload }}</v-icon>
        </td>
        <td class=" " :colspan="filteredHeaders.length">..</td>
    </tr>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import GcodefilesMixin from '@/components/mixins/gcodefiles'
import { mdiFolderUpload } from '@mdi/js'

@Component
export default class GcodefilesPanelTableRowBack extends Mixins(BaseMixin, GcodefilesMixin) {
    mdiFolderUpload = mdiFolderUpload

    isHover = false

    get trClasses() {
        return {
            'file-list-cursor': true,
            'file-list-row-hover': this.isHover,
        }
    }

    goBackAction() {
        this.currentPath = this.currentPath.substring(0, this.currentPath.lastIndexOf('/'))
    }

    onDrop(e: DragEvent) {
        e.preventDefault()
        this.isHover = false

        const dragFilename = e.dataTransfer?.getData('filename')

        const source = [this.currentPath, dragFilename].join('/')
        const dest = [this.currentPath, '..', dragFilename].join('/')

        this.$socket.emit(
            'server.files.move',
            {
                source: 'gcodes' + source,
                dest: 'gcodes' + dest,
            },
            { action: 'files/getMove' }
        )
    }

    // this function is important to disable the browser default function to activate the onDrop function
    onDragOver(e: DragEvent) {
        e.preventDefault()
    }
}
</script>

<style scoped>
.file-list-row-hover {
    background-color: #43a04720;
}
</style>
