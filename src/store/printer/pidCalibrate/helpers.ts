import { PidCalibratePid } from '@/store/printer/pidCalibrate/types'

// Klipper's PID_CALIBRATE (klippy/extras/pid_calibrate.py, class ControlAutoTune) always derives
// PID constants from a measured oscillation amplitude/period using Ziegler-Nichols:
//   Ti = 0.5 * Tu, Td = 0.125 * Tu, Kp = 0.6 * Ku * PID_PARAM_BASE, Ki = Kp / Ti, Kd = Kp * Td
// Since Ti = Kp/Ki and Td = Kd/Kp, this always implies the identity Kp^2 == 4 * Ki * Kd for any
// values that came out of Klipper's own autotune. A tolerance is needed because Klipper reports
// (and configfile.settings stores) the constants rounded to 3 decimals.
const ZIEGLER_NICHOLS_IDENTITY_TOLERANCE = 0.05

// A % difference this small between the Kp/Ki/Kd ratios is treated as "the same tuning shape,
// just scaled" rather than a fundamentally different oscillation period between the two runs.
const RATIO_CONSISTENCY_TOLERANCE = 0.15

const PID_CALIBRATE_REGEX = /^\s*PID_CALIBRATE\s+(.*)$/i
const HEATER_PARAM_REGEX = /\bHEATER=(\S+)/i
const TARGET_PARAM_REGEX = /\bTARGET=(-?[\d.]+)/i

// Exact wire format confirmed against klippy/extras/pid_calibrate.py's gcmd.respond_info() call,
// which klippy/gcode.py's respond_info() sends as a single multi-line message with every line
// prefixed by "// ". This is Klipper's own standard completion message, not project-specific.
const RESULT_REGEX = /^\/\/ PID parameters: pid_Kp=(-?[\d.]+) pid_Ki=(-?[\d.]+) pid_Kd=(-?[\d.]+)/

// Klipper's autotune (ControlAutoTune in klippy/extras/pid_calibrate.py) always steps the
// heater's *visible* target down by exactly this much while "cooling" between peaks, via the
// standard heater.alter_target() call - a fixed Klipper constant, not project-specific.
export const PID_CALIBRATE_TUNE_DELTA = 5.0

// ControlAutoTune.check_busy() keeps the calibration running until 12 peaks have been recorded
// (klippy/extras/pid_calibrate.py) - also a fixed Klipper constant.
export const PID_CALIBRATE_PEAKS_NEEDED = 12

const TARGET_MATCH_TOLERANCE = 0.01

function isCloseTo(a: number, b: number): boolean {
    return Math.abs(a - b) < TARGET_MATCH_TOLERANCE
}

/**
 * Klipper's autotune alternates the heater's standard `target` field between the calibration
 * temperature and `calibrationTarget - PID_CALIBRATE_TUNE_DELTA` once per detected oscillation
 * peak. Since Mainsail (like any Moonraker client) already polls/subscribes to that field for
 * every heater, watching it is a generic way to observe calibration progress without depending
 * on anything beyond stock Klipper. Returns true when `newTarget` is a genuine toggle away from
 * `lastObservedTarget` - i.e. it matches the *other* of the two expected levels, not a repeat.
 */
export function isPidCalibrateTargetToggle(
    calibrationTarget: number,
    lastObservedTarget: number,
    newTarget: number
): boolean {
    const lowLevel = calibrationTarget - PID_CALIBRATE_TUNE_DELTA

    if (isCloseTo(newTarget, lastObservedTarget)) return false
    if (isCloseTo(lastObservedTarget, calibrationTarget) && isCloseTo(newTarget, lowLevel)) return true
    if (isCloseTo(lastObservedTarget, lowLevel) && isCloseTo(newTarget, calibrationTarget)) return true

    return false
}

/**
 * Klipper's ControlAutoTune always starts with `heating = False` and the target already at the
 * calibration temperature (set before the control loop ever ticks), so its very first recorded
 * peak comes from a same-value alter_target() call that produces no visible change on `target`.
 * Every later peak *does* toggle the visible value. So the observed toggle count is always one
 * behind Klipper's true internal peak count; crediting that first, unobservable peak (+1) once a
 * calibration is confirmed running gives a closer, still-honest estimate - never claimed as exact.
 */
export function estimatedPeaksObserved(observedToggles: number): number {
    return Math.min(PID_CALIBRATE_PEAKS_NEEDED, observedToggles + 1)
}

export function shortHeaterName(objectName: string): string {
    const splits = objectName.split(' ')
    return splits.length === 1 ? objectName : splits[1]
}

/**
 * Parses an outgoing gcode string for a `PID_CALIBRATE HEATER=<name> TARGET=<temp>` command.
 * Returns null for anything else.
 */
export function parsePidCalibrateCommand(gcode: string): { heaterName: string; target: number } | null {
    if (typeof gcode !== 'string') return null

    const commandMatch = PID_CALIBRATE_REGEX.exec(gcode)
    if (!commandMatch) return null

    const heaterMatch = HEATER_PARAM_REGEX.exec(commandMatch[1])
    const targetMatch = TARGET_PARAM_REGEX.exec(commandMatch[1])
    if (!heaterMatch || !targetMatch) return null

    const target = parseFloat(targetMatch[1])
    if (isNaN(target)) return null

    return { heaterName: heaterMatch[1], target }
}

/**
 * Parses an incoming console message for Klipper's standard PID_CALIBRATE completion line.
 * Returns null for any other message (including the "pid_calibrate interrupted" / heater-fault
 * error responses, which are handled separately since they carry no PID numbers).
 */
export function parsePidCalibrateResult(message: string): PidCalibratePid | null {
    if (typeof message !== 'string') return null

    const match = RESULT_REGEX.exec(message)
    if (!match) return null

    return {
        kp: parseFloat(match[1]),
        ki: parseFloat(match[2]),
        kd: parseFloat(match[3]),
    }
}

export function isGcodeErrorResponse(message: string): boolean {
    return typeof message === 'string' && message.startsWith('!! ')
}

/**
 * A `!! ` error response only counts as a PID_CALIBRATE failure when it plausibly belongs to it:
 * either the calibration's own error ("pid_calibrate interrupted", klippy/extras/pid_calibrate.py)
 * or a heater fault naming the heater being calibrated ("Heater <name> not heating at expected
 * rate", klippy/extras/verify_heater.py). Any other unrelated error arriving while a calibration
 * happens to be running must NOT be allowed to mark it failed - that would also silently discard
 * the real completion message once it later arrives, since it's no longer tracked as "running".
 */
export function isPidCalibrateFailure(message: string, heaterName: string): boolean {
    if (!isGcodeErrorResponse(message)) return false

    return /pid_calibrate/i.test(message) || message.includes(heaterName)
}

/**
 * Reads the PID constants that were active for a heater before a calibration run, straight from
 * the standard `configfile.settings` printer object. Returns null when the heater wasn't using
 * PID control (e.g. a fresh `[heater_bed]` still on the "watermark" bang-bang default) - there is
 * nothing meaningful to compare against in that case.
 */
export function extractPreviousPid(settings: Record<string, unknown> | null | undefined): PidCalibratePid | null {
    if (!settings) return null
    if (settings.control !== 'pid') return null

    const kp = Number(settings.pid_kp)
    const ki = Number(settings.pid_ki)
    const kd = Number(settings.pid_kd)
    if ([kp, ki, kd].some((value) => isNaN(value))) return null

    return { kp, ki, kd }
}

export interface PidCalibrateComparison {
    kpDeltaPercent: number
    kiDeltaPercent: number
    kdDeltaPercent: number
    // True when `previous` is internally consistent with Klipper's own Ziegler-Nichols formula,
    // i.e. it plausibly came from an earlier PID_CALIBRATE run rather than a hand-tuned/vendor value.
    previousLooksAutotuned: boolean
    // True when previous+new both look autotuned AND scaled by roughly the same ratio, meaning the
    // measured oscillation period was stable and only the response strength changed.
    isProportionalRetune: boolean
    // Average of the three ratios, only meaningful when isProportionalRetune is true.
    aggressivenessDeltaPercent: number
}

function percentDelta(previous: number, next: number): number {
    if (previous === 0) return 0
    return ((next - previous) / Math.abs(previous)) * 100
}

function satisfiesZieglerNicholsIdentity(pid: PidCalibratePid): boolean {
    const { kp, ki, kd } = pid
    if (ki === 0 || kd === 0) return false

    const lhs = kp * kp
    const rhs = 4 * ki * kd
    if (rhs === 0) return false

    return Math.abs(lhs - rhs) / rhs < ZIEGLER_NICHOLS_IDENTITY_TOLERANCE
}

export function buildPidComparison(previous: PidCalibratePid, next: PidCalibratePid): PidCalibrateComparison {
    const kpDeltaPercent = percentDelta(previous.kp, next.kp)
    const kiDeltaPercent = percentDelta(previous.ki, next.ki)
    const kdDeltaPercent = percentDelta(previous.kd, next.kd)

    const previousLooksAutotuned = satisfiesZieglerNicholsIdentity(previous) && satisfiesZieglerNicholsIdentity(next)

    const ratios = [kpDeltaPercent, kiDeltaPercent, kdDeltaPercent]
    const maxRatio = Math.max(...ratios)
    const minRatio = Math.min(...ratios)
    const ratiosAreConsistent = Math.abs(maxRatio - minRatio) < RATIO_CONSISTENCY_TOLERANCE * 100

    const isProportionalRetune = previousLooksAutotuned && ratiosAreConsistent

    return {
        kpDeltaPercent,
        kiDeltaPercent,
        kdDeltaPercent,
        previousLooksAutotuned,
        isProportionalRetune,
        aggressivenessDeltaPercent: (kpDeltaPercent + kiDeltaPercent + kdDeltaPercent) / 3,
    }
}
