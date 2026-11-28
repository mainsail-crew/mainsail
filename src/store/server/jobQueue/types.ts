import type { FileStateGcodefile } from '@/store/files/types'
import type { QueuedJob, QueueState } from '@/types/moonraker/JobQueueRPC'

export interface ServerJobQueueState {
    queued_jobs: QueuedJob[]
    /** null until the queue status was loaded */
    queue_state: QueueState | null
}

/** Consecutive queued jobs of the same file, shown as one entry */
export interface ServerJobQueueStateJob extends QueuedJob {
    metadata: FileStateGcodefile | null
    /** Ids of the following jobs of the same file, `job_id` is the first job of the group */
    combinedIds: string[]
}

/** A file and how often it is printed in a row */
export interface ServerJobQueueEntry {
    filename: string
    count: number
}
