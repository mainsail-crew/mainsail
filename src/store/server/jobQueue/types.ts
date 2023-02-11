export interface ServerJobQueueState {
    queued_jobs: ServerJobQueueStateJob[]
    queue_state: string
}

export interface ServerJobQueueStateJob {
    filename: string
    job_id: string
    time_added: number
    time_in_queue: number
    metadata?: any
    isFirst?: boolean
    combinedIds?: string[]
}
