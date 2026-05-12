/**
 * Job History Management RPC Interface
 *
 * Moonraker's `history` component tracks print job completion data.
 * These endpoints are available to manage Moonraker's job history data.
 *
 * @see https://moonraker.readthedocs.io/en/latest/external_api/history/
 */
export interface HistoryRPC {
    /**
     * Get job list.
     * Returns a list of job history entries matching the specified criteria.
     */
    'server.history.list': (params?: {
        /** Maximum number of job entries to return (default: 50) */
        limit?: number
        /** The record number indicating the first entry of the returned list (default: 0) */
        start?: number
        /** A timestamp in unix time. When specified, only entries created before this date are returned */
        before?: number
        /** A timestamp in unix time. When specified, only entries created after this date are returned */
        since?: number
        /** The order of the list returned. May be 'asc' (ascending) or 'desc' (descending) (default: 'desc') */
        order?: 'asc' | 'desc'
    }) => Promise<{
        /** The number of entries returned by the query */
        count: number
        /** An array of Job History objects */
        jobs: HistoryJob[]
    }>

    /**
     * Get job totals.
     * Returns accumulated totals across all job history entries.
     */
    'server.history.totals': () => Promise<{
        /** A Job Totals object reporting all current totals */
        job_totals: HistoryJobTotals
        /** An array of Auxiliary Total objects */
        auxiliary_totals: HistoryAuxiliaryTotal[]
    }>

    /**
     * Reset totals.
     * Resets the persistent "job totals" to zero.
     */
    'server.history.reset_totals': () => Promise<{
        /** A Job Totals object reporting all totals prior to the reset */
        last_totals: HistoryJobTotals
        /** An array of Auxiliary Total objects reporting totals prior to the reset */
        last_auxiliary_totals: HistoryAuxiliaryTotal[]
    }>

    /**
     * Get a single job.
     * Returns a specific job history entry by its unique identifier.
     */
    'server.history.get_job': (params: {
        /** The unique identifier for the requested job history (required) */
        uid: string
    }) => Promise<{
        /** The requested Job History object */
        job: HistoryJob
    }>

    /**
     * Delete a job.
     * Deletes one or all job history entries.
     */
    'server.history.delete_job': (
        params:
            | {
                  /** The unique identifier for the job entry to delete (required if all is false) */
                  uid: string
                  /** When set to true all job history entries will be removed */
                  all?: false
              }
            | {
                  /** When set to true all job history entries will be removed */
                  all: true
              }
    ) => Promise<{
        /** An array of unique IDs indicating the job entries that were deleted */
        deleted_jobs: string[]
    }>
}

/**
 * Job History Entry
 *
 * Represents a single print job history record.
 */
export interface HistoryJob {
    /** A unique ID for the entry */
    job_id: string
    /** The user that started the job. Will be null if Moonraker cannot identify a user (ie: job was started via Klipper's display) */
    user: string | null
    /** The path, relative to gcodes root, of the file associated with the job */
    filename: string
    /** A value of true indicates that the file associated with the job exists on disk and has not been modified */
    exists: boolean
    /** The job status at the time of query */
    status: HistoryJobStatus
    /** A timestamp, in unix time, indicating when the job started */
    start_time: number
    /** A timestamp, in unix time, indicating when the job finished. Will be null if the job is in progress or if Moonraker is interrupted prior to the job completion */
    end_time: number | null
    /** The amount of time, in seconds, the job spent printing (ie: printer not idle) */
    print_duration: number
    /** The total amount of time, in seconds, the job took to print. This includes time paused */
    total_duration: number
    /** The amount of filament (in mm) used during the job */
    filament_used: number
    /** The gcode metadata object associated with the job. The job_id and print_start_time fields are removed from the metadata as they are redundant */
    metadata: Record<string, unknown>
    /** An array of auxiliary field objects containing supplemental history data related to the job */
    auxiliary_data?: HistoryAuxiliaryField[]
}

/**
 * Job History Status
 *
 * Represents the possible states of a print job.
 */
export type HistoryJobStatus =
    /** The job is currently active */
    | 'in_progress'
    /** The job successfully completed */
    | 'completed'
    /** The job was cancelled by the user */
    | 'cancelled'
    /** The job was aborted due to an error during execution */
    | 'error'
    /** The job was aborted due to Klippy Shutdown */
    | 'klippy_shutdown'
    /** Moonraker's connection to Klippy was lost while the job was in progress */
    | 'klippy_disconnect'
    /** Moonraker was abruptly terminated while the job was in progress */
    | 'interrupted'

/**
 * Auxiliary Field
 *
 * Contains supplemental history data related to a job, provided by components or extensions.
 */
export interface HistoryAuxiliaryField {
    /** The component or extension that generated the auxiliary field */
    provider: string
    /** A name identifying the field */
    name: string
    /** A brief description of the data in this entry */
    description: string
    /** The value associated with the field. Can be any valid JSON type */
    value: unknown
    /** The unit type associated with the value (e.g., 'mm' for millimeters). Can be null if no unit abbreviation is appropriate */
    units: string | null
}

/**
 * Job Totals
 *
 * Accumulated totals across all job history entries.
 */
export interface HistoryJobTotals {
    /** The total number of jobs tracked */
    total_jobs: number
    /** The total amount of job work time (in seconds) across all jobs, including time paused */
    total_time: number
    /** The total amount of time printing (in seconds) across all jobs */
    total_print_time: number
    /** The total amount of filament used (in mm) across all jobs */
    total_filament_used: number
    /** The maximum time spent working on a single job, including time paused */
    longest_job: number
    /** The maximum time spent printing a single job */
    longest_print: number
}

/**
 * Auxiliary Total
 *
 * Accumulated totals for auxiliary fields across all job history entries.
 */
export interface HistoryAuxiliaryTotal {
    /** The component or extension that generated the auxiliary totals */
    provider: string
    /** The corresponding name of the auxiliary field used to generate totals */
    field: string
    /** The maximum value observed across all prints. Will be null if the maximum is not available */
    maximum: number | null
    /** The accumulated total value across all prints. Will be null if the total is not available */
    total: number | null
}
