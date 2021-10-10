export interface ServerHistoryState {
    jobs: ServerHistoryStateJob[],
    job_totals: {
        total_jobs: number
        total_time: number
        total_print_time: number
        total_filament_used: number
        longest_job: number
        longest_print: number
    }
}

export interface ServerHistoryStateJob {
    job_id: string
    exists: boolean
    end_time: number
    filament_used: number
    filename:string
    // eslint-disable-next-line
    metadata: any
    print_duration: number
    status: string
    start_time: number
    total_duration: number
}