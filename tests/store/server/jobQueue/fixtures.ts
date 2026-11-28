import type { QueuedJob } from '@/types/moonraker/JobQueueRPC'

export const queuedJob = (job_id: string, filename: string): QueuedJob => ({
    filename,
    job_id,
    time_added: 1000,
    time_in_queue: 10,
})
