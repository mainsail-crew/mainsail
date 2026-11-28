/**
 * Job Queue Management RPC Interface
 *
 * Moonraker's job queue is implemented as a FIFO queue and may contain multiple
 * references to the same file. All filenames are relative to the `gcodes` root.
 *
 * Note: Every method returns the current queue status (see {@link JobQueueStatus}).
 *
 * @see https://moonraker.readthedocs.io/en/latest/external_api/job_queue/
 */
export interface JobQueueRPC {
    /**
     * Get job queue status.
     * Retrieves the current state of the job queue.
     */
    'server.job_queue.status': () => Promise<JobQueueStatus>

    /**
     * Enqueue a job.
     * Adds a job, or an array of jobs, to the end of the job queue. The same filename may be
     * specified multiple times to queue a job that repeats. The request is aborted and returns
     * an error if any of the supplied files do not exist.
     */
    'server.job_queue.post_job': (params: {
        /**
         * An array of filenames of jobs to add to the queue, relative to the `gcodes` root (required).
         * Note: Not documented, but Moonraker also accepts a single filename or a comma separated string.
         */
        filenames: string[]
        /** When set to true the job queue will be cleared prior to adding the requested jobs (default: false) */
        reset?: boolean
    }) => Promise<JobQueueStatus>

    /**
     * Remove a job.
     * Removes one or more jobs from the queue. Job ids that do not exist are silently ignored.
     *
     * Note: Moonraker does not emit a notification if the queue was already empty.
     */
    'server.job_queue.delete_job': (
        params:
            | {
                  /** An array of job ids to remove from the queue (required if `all` is false) */
                  job_ids: string[]
              }
            | {
                  /** When set to true all jobs will be removed from the queue */
                  all: true
              }
    ) => Promise<JobQueueStatus>

    /**
     * Pause the job queue.
     * Prevents the next job in the queue from loading after the job in progress is complete.
     * If the queue is paused while it is in the `loading` state the load will be aborted.
     */
    'server.job_queue.pause': () => Promise<JobQueueStatus>

    /**
     * Start the job queue.
     * If Klipper is ready to start a print the next job in the queue will be loaded.
     * Otherwise the queue will be put into the `ready` state, where the job will be loaded
     * after the current job completes.
     *
     * Note: Moonraker loads the next job asynchronously, so the response reports the `loading` state.
     * The queue stays `paused` if it is empty, or if Klipper is not ready and `automatic_transition` is disabled.
     */
    'server.job_queue.start': () => Promise<JobQueueStatus>

    /**
     * Perform a queue jump.
     * Jumps a job to the front of the queue. Returns an error if the job id does not exist.
     *
     * Note: Moonraker does not emit a notification for a queue jump.
     */
    'server.job_queue.jump': (params: {
        /** The job id of the job to jump to the front of the queue (required) */
        job_id: string
    }) => Promise<JobQueueStatus>
}

/**
 * Queue State
 *
 * - `ready`: The queue is active and will load the next queued job upon completion of the current job
 * - `loading`: The queue is currently loading the next job (incl. `job_transition_delay` and `job_transition_gcode`)
 * - `starting`: The queue is requesting Klipper to start the print
 * - `paused`: The queue will not load the next queued job after a working job has completed.
 *   Note: This is also the initial state after Moonraker started.
 */
export type QueueState = 'ready' | 'loading' | 'starting' | 'paused'

/**
 * Queued Job
 *
 * Represents a single job in the queue.
 */
export interface QueuedJob {
    /** The name of the gcode file queued, relative to the `gcodes` root */
    filename: string
    /** A unique ID assigned to the queued job */
    job_id: string
    /** The time (in unix time) the job was added to the queue */
    time_added: number
    /** The cumulative amount of time, in seconds, the job has been pending in the queue */
    time_in_queue: number
}

/**
 * Job Queue Status
 *
 * Returned by all job queue methods.
 */
export interface JobQueueStatus {
    /** An array of Queued Job objects */
    queued_jobs: QueuedJob[]
    /** The current state of the job queue */
    queue_state: QueueState
}

/**
 * Job Queue Changed Action
 *
 * - `state_changed`: The internal job queue state has changed
 * - `jobs_added`: One or more jobs have been added to the queue
 * - `jobs_removed`: One or more jobs have been removed from the queue
 * - `job_loaded`: A job has been popped from the queue and successfully started
 */
export type JobQueueChangedAction = 'state_changed' | 'jobs_added' | 'jobs_removed' | 'job_loaded'

/**
 * Payload of the notify_job_queue_changed notification.
 * Emitted when the job queue state changes and when the queue is modified.
 *
 * Note: Moonraker sends the notification with a delay of 50ms, but the payload reflects the queue at the time
 * of the change.
 * @see https://moonraker.readthedocs.io/en/latest/external_api/jsonrpc_notifications/#job-queue-changed
 */
export interface JobQueueChangedNotification {
    /** The action that triggered the notification */
    action: JobQueueChangedAction
    /** An array of Queued Job objects reflecting the updated queue. null if the queue has not changed */
    updated_queue: QueuedJob[] | null
    /** The current state of the job queue */
    queue_state: QueueState
}
