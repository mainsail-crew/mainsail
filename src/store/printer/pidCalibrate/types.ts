export type PidCalibrateStatus = 'running' | 'success' | 'failed'

export interface PidCalibratePid {
    kp: number
    ki: number
    kd: number
}

export interface PidCalibrateEntry {
    // short heater name as used in `PID_CALIBRATE HEATER=<name>` (e.g. "extruder", "heater_bed", "chamber")
    heaterName: string
    // full printer object name (e.g. "heater_generic chamber"), used to read configfile.settings
    objectName: string
    target: number
    status: PidCalibrateStatus
    startedAt: number
    finishedAt: number | null
    // last value observed on the heater's standard `target` field, used to detect the toggling
    // Klipper's autotune performs between `target` and `target - PID_CALIBRATE_TUNE_DELTA`
    lastObservedTarget: number | null
    // count of genuine toggles observed (see isPidCalibrateTargetToggle) - an approximation of
    // calibration progress, not a value Klipper reports directly
    observedToggles: number
    // PID constants read from configfile.settings at the moment the command was sent, if any existed
    previous: PidCalibratePid | null
    result: PidCalibratePid | null
    errorMessage: string | null
}

export interface PrinterPidCalibrateState {
    entries: Record<string, PidCalibrateEntry>
}
