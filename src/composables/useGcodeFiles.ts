import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { FileStateFile } from '@/store/files/types'

export interface TableColumnSetting {
    text: string
    value: string
    visible: boolean
    sortable?: boolean
    class?: string
    pos?: number
    outputType?: 'string' | 'date' | 'length' | 'weight' | 'filesize' | 'temp' | 'time'
}

export function useGcodeFiles() {
    const store = useStore()
    const { t } = useI18n()

    const search = computed(() => store.state.gui.view.gcodefiles.search ?? '')

    function setSearch(value: string) {
        store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.search', value })
    }

    const currentPath = computed(() => {
        const path = store.state.gui.view.gcodefiles.currentPath ?? ''
        if (path === 'gcodes') return ''
        return path
    })

    function setCurrentPath(newVal: string) {
        store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.currentPath', value: newVal })
    }

    const showHiddenFiles = computed(
        () => store.state.gui.view.gcodefiles.showHiddenFiles ?? false
    )

    function setShowHiddenFiles(newVal: boolean) {
        store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.showHiddenFiles', value: newVal })
    }

    const showCompletedFiles = computed(
        () => store.state.gui.view.gcodefiles.showCompletedFiles ?? true
    )

    function setShowCompletedFiles(newVal: boolean) {
        store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.showCompletedFiles', value: newVal })
    }

    const files = computed(() =>
        store.getters['files/getGcodeFiles'](
            currentPath.value,
            showHiddenFiles.value,
            showCompletedFiles.value
        )
    )

    const hideMetadataColumns = computed(
        () => store.state.gui.view.gcodefiles.hideMetadataColumns ?? []
    )

    function setHideMetadataColumns(newVal: string[]) {
        store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.hideMetadataColumns', value: newVal })
    }

    const orderMetadataColumns = computed(
        () => store.state.gui.view.gcodefiles.orderMetadataColumns ?? []
    )

    function setOrderMetadataColumns(newVal: string[]) {
        store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.orderMetadataColumns', value: newVal })
    }

    const fixedHeaders = computed<TableColumnSetting[]>(() => [
        { text: '', value: '', visible: true, sortable: false },
        { text: t('Files.Name').toString(), value: 'filename', visible: true, class: 'text-no-wrap' },
        { text: '', value: 'status', visible: true, class: 'text-no-wrap', sortable: false },
    ])

    const configurableHeaders = computed<TableColumnSetting[]>(() => {
        const headers: TableColumnSetting[] = [
            {
                text: t('Files.Filesize').toString(),
                value: 'size',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'filesize',
            },
            {
                text: t('Files.LastModified').toString(),
                value: 'modified',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'date',
            },
            {
                text: t('Files.PrintTime').toString(),
                value: 'estimated_time',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'time',
            },
            {
                text: t('Files.LastStartTime').toString(),
                value: 'last_start_time',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'date',
            },
            {
                text: t('Files.LastEndTime').toString(),
                value: 'last_end_time',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'date',
            },
            {
                text: t('Files.LastPrintDuration').toString(),
                value: 'last_print_duration',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'time',
            },
            {
                text: t('Files.LastTotalDuration').toString(),
                value: 'last_total_duration',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'time',
            },
            {
                text: t('Files.Slicer').toString(),
                value: 'slicer',
                visible: true,
                class: 'text-no-wrap',
                outputType: 'string',
            },
        ]

        let unknownPos = 0
        headers.forEach((header) => {
            header.visible = !hideMetadataColumns.value.includes(header.value)

            let pos = orderMetadataColumns.value?.findIndex(
                (value: string) => value === header.value
            )
            if (pos === -1) {
                unknownPos++
                pos = orderMetadataColumns.value.length + unknownPos
            }
            header.pos = pos
        })

        return headers.sort((a, b) => (a.pos ?? 0) - (b.pos ?? 0))
    })

    function setConfigurableHeaders(newVal: TableColumnSetting[]) {
        const orderArray: string[] = []
        newVal.forEach((row: TableColumnSetting) => orderArray.push(row.value))
        setOrderMetadataColumns(orderArray)
    }

    const headers = computed(() => [...fixedHeaders.value, ...configurableHeaders.value])

    const filteredHeaders = computed(() => headers.value.filter((header) => header.visible))

    const tableColumns = computed(() =>
        configurableHeaders.value.filter((column) => column.visible)
    )

    const selectedFiles = computed(() => store.state.gui.view.gcodefiles.selectedFiles ?? [])

    function setSelectedFiles(newVal: string[]) {
        store.dispatch('gui/saveSetting', { name: 'view.gcodefiles.selectedFiles', value: newVal })
    }

    function existsFilename(name: string) {
        return files.value.findIndex((file: FileStateFile) => file.filename === name) >= 0
    }

    return {
        search,
        setSearch,
        currentPath,
        setCurrentPath,
        showHiddenFiles,
        setShowHiddenFiles,
        showCompletedFiles,
        setShowCompletedFiles,
        files,
        hideMetadataColumns,
        setHideMetadataColumns,
        orderMetadataColumns,
        setOrderMetadataColumns,
        fixedHeaders,
        configurableHeaders,
        setConfigurableHeaders,
        headers,
        filteredHeaders,
        tableColumns,
        selectedFiles,
        setSelectedFiles,
        existsFilename,
    }
}
