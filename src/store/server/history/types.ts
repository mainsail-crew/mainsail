import type {
    HistoryAuxiliaryTotal,
    HistoryJob,
    HistoryJobMetadata,
    HistoryJobTotals,
} from '@/types/moonraker/HistoryRPC'

export interface ServerHistoryState {
    jobs: ServerHistoryStateJob[]
    job_totals: HistoryJobTotals
    auxiliary_totals: HistoryAuxiliaryTotal[]
    all_loaded: boolean
}

export interface ServerHistoryStateJob extends Omit<HistoryJob, 'metadata'> {
    metadata: ServerHistoryStateJobMetadata
    /** User note, stored in the history_notes namespace of the Moonraker database */
    note?: string
}

/** Moonraker passes through metadata fields that are not typed (e.g. added by newer versions) */
export interface ServerHistoryStateJobMetadata extends HistoryJobMetadata {
    [key: string]: unknown
}

/** Identifies a gcode file to find its jobs. `modified` is in milliseconds. */
export interface ServerHistoryFileReference {
    modified: number
    size: number
    uuid: string | null
    job_id: string | null
}

/** Jobs indexed by uuid, file (size and modified date) and job id */
export interface ServerHistoryJobIndex {
    byUuid: Map<string, ServerHistoryStateJob[]>
    byFile: Map<string, ServerHistoryStateJob[]>
    byJobId: Map<string, ServerHistoryStateJob>
}

export interface HistoryListRowJob extends ServerHistoryStateJob {
    type: 'job'
    select_id: string
}

export interface ServerHistoryStateAllPrintStatusEntry {
    name: string
    displayName: string
    value: number
    showInTable: boolean
    itemStyle: {
        opacity: number
        color: string
        borderColor: string
        borderWidth: number
        borderRadius: number
    }
}

export type HistoryStatsValueNames = 'jobs' | 'filament' | 'time'

export type HistoryListPanelColValue = Extract<
    keyof ServerHistoryStateJob | keyof ServerHistoryStateJob['metadata'],
    string
>

export interface HistoryListPanelCol {
    text: string
    value: HistoryListPanelColValue
    align: string
    configable: boolean
    visible: boolean
    filterable?: boolean
    outputType?: string
}

export interface ServerHistoryStateJobWithCount extends ServerHistoryStateJob {
    count: number
}
