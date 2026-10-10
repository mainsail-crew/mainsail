import { describe, expect, it } from 'vitest'
import { compileRegexPatterns, isValidRegex } from '@/plugins/helpers'
import { builtInBackupFileFilters } from '@/store/variables'

const isHidden = (filename: string, patterns: string[]) =>
    compileRegexPatterns(patterns).some((matcher) => matcher.test(filename))

describe('backup file filters', () => {
    describe('isValidRegex', () => {
        it('accepts valid expressions', () => {
            expect(isValidRegex('\\.bak$')).toBe(true)
            expect(isValidRegex('')).toBe(true)
        })

        it('rejects invalid expressions', () => {
            expect(isValidRegex('(')).toBe(false)
            expect(isValidRegex('[a-')).toBe(false)
            expect(isValidRegex('*.bak')).toBe(false)
        })
    })

    describe('compileRegexPatterns', () => {
        it('returns an empty list for no patterns', () => {
            expect(compileRegexPatterns([])).toEqual([])
        })

        it('skips invalid patterns and keeps the order of valid ones', () => {
            const matchers = compileRegexPatterns(['\\.bak$', '(', '\\.old$'])

            expect(matchers.map((matcher) => matcher.source)).toEqual(['\\.bak$', '\\.old$'])
        })
    })

    describe('built-in filters', () => {
        it('are all valid expressions', () => {
            expect(builtInBackupFileFilters.every(isValidRegex)).toBe(true)
        })

        it('hide Klipper, crowsnest and .bkp backups', () => {
            expect(isHidden('printer-20240101_120000.cfg', builtInBackupFileFilters)).toBe(true)
            expect(isHidden('crowsnest.conf.2024-01-01-1200', builtInBackupFileFilters)).toBe(true)
            expect(isHidden('macros.cfg.bkp', builtInBackupFileFilters)).toBe(true)
        })

        it('keep regular config files', () => {
            expect(isHidden('printer.cfg', builtInBackupFileFilters)).toBe(false)
            expect(isHidden('crowsnest.conf', builtInBackupFileFilters)).toBe(false)
            expect(isHidden('moonraker.conf', builtInBackupFileFilters)).toBe(false)
            expect(isHidden('printer-2024_01.cfg', builtInBackupFileFilters)).toBe(false)
        })
    })

    describe('custom filters', () => {
        const patterns = [...builtInBackupFileFilters, '\\.old-\\d{8}-\\d{6}$', '\\.conf\\.\\d{2}$', '\\.bak$']

        it('hide files matching custom patterns in addition to the built-ins', () => {
            expect(isHidden('printer.cfg.old-20240101-120000', patterns)).toBe(true)
            expect(isHidden('moonraker.conf.01', patterns)).toBe(true)
            expect(isHidden('macros.cfg.bak', patterns)).toBe(true)
            expect(isHidden('printer-20240101_120000.cfg', patterns)).toBe(true)
        })

        it('keep files that match no pattern', () => {
            expect(isHidden('printer.cfg', patterns)).toBe(false)
            expect(isHidden('moonraker.conf', patterns)).toBe(false)
        })

        it('ignore invalid saved patterns without affecting the others', () => {
            expect(isHidden('macros.cfg.bak', ['(', '\\.bak$'])).toBe(true)
            expect(isHidden('printer.cfg', ['('])).toBe(false)
        })
    })
})
