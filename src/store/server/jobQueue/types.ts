export interface ServerJobQueueState {
    queued_jobs: ServerJobQueueStateJobs[],
    queue_state: string
}

export interface ServerJobQueueStateJobs {
    filename:string
    job_id: string
    time_added: number
    time_in_queue: number
}