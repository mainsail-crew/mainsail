export interface ServerHistoryState {
    jobs: ServerHistoryStateJob[]
    job_totals: {
        total_jobs: number
        total_time: number
        total_print_time: number
        total_filament_used: number
        longest_job: number
        longest_print: number
    }
    all_loaded: boolean
}

export interface ServerHistoryStateJob {
    job_id: string
    exists: boolean
    end_time: number
    filament_used: number
    filename: string
    // eslint-disable-next-line
    metadata: any
    note?: string
    print_duration: number
    status: string
    start_time: number
    total_duration: number
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
