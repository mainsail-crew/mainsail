import { describe, expect, it } from 'vitest'
import {
    buildPidComparison,
    estimatedPeaksObserved,
    extractPreviousPid,
    isGcodeErrorResponse,
    isPidCalibrateFailure,
    isPidCalibrateTargetToggle,
    parsePidCalibrateCommand,
    parsePidCalibrateResult,
    shortHeaterName,
} from '@/store/printer/pidCalibrate/helpers'

describe('printer/pidCalibrate/shortHeaterName', () => {
    it('returns the name unchanged when there is no prefix', () => {
        expect(shortHeaterName('extruder')).toBe('extruder')
    })

    it('strips the config-section prefix', () => {
        expect(shortHeaterName('heater_generic chamber')).toBe('chamber')
    })
})

describe('printer/pidCalibrate/parsePidCalibrateCommand', () => {
    it('parses a standard command', () => {
        expect(parsePidCalibrateCommand('PID_CALIBRATE HEATER=extruder TARGET=210')).toEqual({
            heaterName: 'extruder',
            target: 210,
        })
    })

    it('is case-insensitive and tolerates parameter order/extra params', () => {
        expect(parsePidCalibrateCommand('pid_calibrate TARGET=110.5 HEATER=heater_bed WRITE_FILE=1')).toEqual({
            heaterName: 'heater_bed',
            target: 110.5,
        })
    })

    it('ignores unrelated commands', () => {
        expect(parsePidCalibrateCommand('SET_HEATER_TEMPERATURE HEATER=extruder TARGET=210')).toBeNull()
        expect(parsePidCalibrateCommand('G28')).toBeNull()
    })

    it('returns null when a required parameter is missing', () => {
        expect(parsePidCalibrateCommand('PID_CALIBRATE HEATER=extruder')).toBeNull()
        expect(parsePidCalibrateCommand('PID_CALIBRATE TARGET=210')).toBeNull()
    })
})

describe('printer/pidCalibrate/parsePidCalibrateResult', () => {
    it('parses the exact message klippy/extras/pid_calibrate.py sends via gcmd.respond_info', () => {
        // klippy/gcode.py respond_info() prefixes every line of the multi-line message with "// "
        const message =
            '// PID parameters: pid_Kp=22.200 pid_Ki=1.080 pid_Kd=114.000\n' +
            '// The SAVE_CONFIG command will update the printer config file\n' +
            '// with these parameters and restart the printer.'

        expect(parsePidCalibrateResult(message)).toEqual({ kp: 22.2, ki: 1.08, kd: 114 })
    })

    it('returns null for unrelated console messages', () => {
        expect(parsePidCalibrateResult('// action:pause')).toBeNull()
        expect(parsePidCalibrateResult('ok')).toBeNull()
        expect(parsePidCalibrateResult('!! pid_calibrate interrupted')).toBeNull()
    })
})

describe('printer/pidCalibrate/isGcodeErrorResponse', () => {
    it('detects Klipper error responses', () => {
        expect(isGcodeErrorResponse('!! pid_calibrate interrupted')).toBe(true)
    })

    it('does not flag normal responses', () => {
        expect(isGcodeErrorResponse('// PID parameters: pid_Kp=1 pid_Ki=1 pid_Kd=1')).toBe(false)
    })
})

describe('printer/pidCalibrate/isPidCalibrateFailure', () => {
    it('matches the calibration interrupted error (pid_calibrate.py)', () => {
        expect(isPidCalibrateFailure('!! pid_calibrate interrupted', 'extruder')).toBe(true)
    })

    it('matches a heater fault naming the calibrated heater (verify_heater.py)', () => {
        expect(isPidCalibrateFailure('!! Heater extruder not heating at expected rate', 'extruder')).toBe(true)
    })

    it('does not attribute an unrelated error to a running calibration', () => {
        expect(isPidCalibrateFailure('!! Must home axis first', 'extruder')).toBe(false)
        expect(isPidCalibrateFailure('!! Heater heater_bed not heating at expected rate', 'extruder')).toBe(false)
    })

    it('ignores non-error responses entirely', () => {
        expect(isPidCalibrateFailure('// PID parameters: pid_Kp=1 pid_Ki=1 pid_Kd=1', 'extruder')).toBe(false)
    })
})

describe('printer/pidCalibrate/isPidCalibrateTargetToggle', () => {
    const calibrationTarget = 210

    it('recognizes the drop to target - TUNE_PID_DELTA', () => {
        expect(isPidCalibrateTargetToggle(calibrationTarget, calibrationTarget, 205)).toBe(true)
    })

    it('recognizes the return to the calibration target', () => {
        expect(isPidCalibrateTargetToggle(calibrationTarget, 205, calibrationTarget)).toBe(true)
    })

    it('ignores a repeat of the same value', () => {
        expect(isPidCalibrateTargetToggle(calibrationTarget, calibrationTarget, calibrationTarget)).toBe(false)
        expect(isPidCalibrateTargetToggle(calibrationTarget, 205, 205)).toBe(false)
    })

    it('ignores a value that matches neither expected level', () => {
        expect(isPidCalibrateTargetToggle(calibrationTarget, calibrationTarget, 0)).toBe(false)
    })
})

describe('printer/pidCalibrate/estimatedPeaksObserved', () => {
    it('credits the one unobservable initial peak', () => {
        expect(estimatedPeaksObserved(0)).toBe(1)
        expect(estimatedPeaksObserved(3)).toBe(4)
    })

    it('caps at the 12 peaks Klipper actually needs', () => {
        expect(estimatedPeaksObserved(11)).toBe(12)
        expect(estimatedPeaksObserved(50)).toBe(12)
    })
})

describe('printer/pidCalibrate/extractPreviousPid', () => {
    it('extracts values recorded with PID control (matches live configfile.settings shape)', () => {
        const settings = { control: 'pid', pid_kp: 22.2, pid_ki: 1.08, pid_kd: 114 }
        expect(extractPreviousPid(settings)).toEqual({ kp: 22.2, ki: 1.08, kd: 114 })
    })

    it('returns null when the heater is not using PID control', () => {
        const settings = { control: 'watermark', max_delta: 1 }
        expect(extractPreviousPid(settings)).toBeNull()
    })

    it('returns null when settings are missing entirely', () => {
        expect(extractPreviousPid(null)).toBeNull()
        expect(extractPreviousPid(undefined)).toBeNull()
    })
})

describe('printer/pidCalibrate/buildPidComparison', () => {
    // Values pulled from a real, currently PID-tuned extruder (control=pid) - satisfies
    // Kp^2 == 4*Ki*Kd, as any output of Klipper's own Ziegler-Nichols autotune must.
    const autotunedPrevious = { kp: 22.2, ki: 1.08, kd: 114 }

    it('recognizes a proportional retune (same oscillation period, different amplitude)', () => {
        const next = { kp: autotunedPrevious.kp * 1.1, ki: autotunedPrevious.ki * 1.1, kd: autotunedPrevious.kd * 1.1 }

        const comparison = buildPidComparison(autotunedPrevious, next)

        expect(comparison.previousLooksAutotuned).toBe(true)
        expect(comparison.isProportionalRetune).toBe(true)
        expect(comparison.aggressivenessDeltaPercent).toBeCloseTo(10, 0)
    })

    it('does not claim a proportional retune when both sides are autotuned but the oscillation period changed', () => {
        // Both satisfy Kp^2 == 4*Ki*Kd individually (Td=5 vs. Td=10, same Kp) but Ki/Kd scale
        // very differently - a real period change between runs, not just a stronger/weaker retune.
        const previous = { kp: 20, ki: 1, kd: 100 }
        const next = { kp: 20, ki: 0.5, kd: 200 }

        const comparison = buildPidComparison(previous, next)

        expect(comparison.previousLooksAutotuned).toBe(true)
        expect(comparison.isProportionalRetune).toBe(false)
    })

    it('does not claim a proportional retune when the previous values were not autotuned', () => {
        // a hand-tuned/vendor-default set that does not satisfy Kp^2 == 4*Ki*Kd
        const handTuned = { kp: 20, ki: 1, kd: 50 }
        const next = { kp: 22, ki: 1.1, kd: 55 }

        const comparison = buildPidComparison(handTuned, next)

        expect(comparison.previousLooksAutotuned).toBe(false)
        expect(comparison.isProportionalRetune).toBe(false)
    })
})
