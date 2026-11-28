import type { HistoryJob } from '@/types/moonraker/HistoryRPC'

export const rawJob = (job_id: string, overrides: Partial<HistoryJob> = {}): HistoryJob => ({
    job_id,
    user: 'No User',
    filename: `${job_id}.gcode`,
    exists: true,
    status: 'completed',
    start_time: 100,
    end_time: 200,
    print_duration: 90,
    total_duration: 100,
    filament_used: 1000,
    metadata: { size: 10, modified: 1 },
    auxiliary_data: [],
    ...overrides,
})
