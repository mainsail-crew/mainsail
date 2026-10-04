import { describe, expect, it } from 'vitest'
import {
    buildNotifyCfg,
    derivePublicKeyFromPem,
    generateVapidKeypair,
    notifyCfgCodeEquals,
    progressSourceFor,
    replaceConfigSection,
    setNotifyCfgSetting,
    toSubscriptionJson,
    urlBase64ToUint8Array,
} from '@/plugins/webpush'

describe('webpush', () => {
    describe('urlBase64ToUint8Array', () => {
        it('decodes a base64url string without padding', () => {
            // "hello" is aGVsbG8 in base64url, which needs one '=' of padding
            expect([...urlBase64ToUint8Array('aGVsbG8')]).toEqual([104, 101, 108, 108, 111])
        })

        it('decodes the base64url alphabet, which differs from base64 in two characters', () => {
            // 0xfb 0xff 0xbf encodes to -_-_ rather than +/+/
            expect([...urlBase64ToUint8Array('-_-_')]).toEqual([251, 255, 191])
        })

        it('decodes a P-256 application server key to 65 bytes', () => {
            const key = 'BD--r2_2FU7ROqS22aheSQtW-oOnoZHHcF2cWgKyBbZbpgAq8wUjJD-VbSCJl-bW5UVOCKMDm0t14D_FdSA7i4U'

            const decoded = urlBase64ToUint8Array(key)

            expect(decoded).toHaveLength(65)
            // an uncompressed EC point always starts with 0x04
            expect(decoded[0]).toBe(4)
        })

        it('returns a view backed by a plain ArrayBuffer, as BufferSource requires', () => {
            expect(urlBase64ToUint8Array('aGVsbG8').buffer).toBeInstanceOf(ArrayBuffer)
        })
    })

    describe('generateVapidKeypair', () => {
        it('produces an application server key and a PKCS#8 private key', async () => {
            const keypair = await generateVapidKeypair()

            // 65 bytes, leading 0x04: the uncompressed point subscribe() expects
            expect(urlBase64ToUint8Array(keypair.publicKey)).toHaveLength(65)
            expect(urlBase64ToUint8Array(keypair.publicKey)[0]).toBe(4)

            expect(keypair.privateKeyPem).toMatch(/^-----BEGIN PRIVATE KEY-----\n/)
            expect(keypair.privateKeyPem).toMatch(/-----END PRIVATE KEY-----\n$/)
        })
    })

    describe('derivePublicKeyFromPem', () => {
        it('recovers the public key the pair was generated with', async () => {
            const keypair = await generateVapidKeypair()

            // the printer only keeps the private half, so this round trip is what
            // lets the public key stop being a stored setting
            await expect(derivePublicKeyFromPem(keypair.privateKeyPem)).resolves.toBe(keypair.publicKey)
        })

        it('reads a key pair generated outside the browser', async () => {
            // anyone who set this up with the old python script keeps working
            const pem =
                '-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg5E+QzvMtGTEMg5Yr\n2O1otpO4SIUiHY1DE17xoRtXF4ehRANCAARIWmwpV0os/O0PG1fQra8yZaHGwdz7\nGfMYEVxrcwSwWV5RT6kLq8vFMTZqorOUcgvqlhNkCvQDKi4xqLj43OzI\n-----END PRIVATE KEY-----\n'

            await expect(derivePublicKeyFromPem(pem)).resolves.toBe(
                'BEhabClXSiz87Q8bV9CtrzJlocbB3PsZ8xgRXGtzBLBZXlFPqQury8UxNmqis5RyC-qWE2QK9AMqLjGouPjc7Mg'
            )
        })

        it('rejects something that is not a private key', async () => {
            await expect(derivePublicKeyFromPem('not a pem')).rejects.toThrow()
        })
    })

    describe('replaceConfigSection', () => {
        const header = '[notifier webpush]'
        const section = `${header}\nurl: vapid://a@b.test/phone\nevents: complete`

        it('replaces a section in place and leaves every other byte alone', () => {
            const before = '[server]\nhost: 0.0.0.0\n\n'
            const after = '\n[authorization]\ntrusted_clients:\n'
            const content = `${before}${header}\nurl: old\nevents: error\n${after}`

            const result = replaceConfigSection(content, header, section)

            expect(result).toContain('url: vapid://a@b.test/phone')
            expect(result).not.toContain('url: old')
            // the surrounding config is untouched, blank separator included
            expect(result.startsWith(before)).toBe(true)
            expect(result.endsWith(after)).toBe(true)
        })

        it('appends the section when it is absent, with one blank separator', () => {
            expect(replaceConfigSection('[server]\nhost: 0.0.0.0\n', header, section)).toBe(
                `[server]\nhost: 0.0.0.0\n\n${section}\n`
            )

            // a file with no trailing newline gets the same treatment
            expect(replaceConfigSection('[server]\nhost: 0.0.0.0', header, section)).toBe(
                `[server]\nhost: 0.0.0.0\n\n${section}\n`
            )

            expect(replaceConfigSection('', header, section)).toBe(`${section}\n`)
        })

        it('removes the section, and its separating blank, when given null', () => {
            const content = `[server]\nhost: 0.0.0.0\n\n${header}\nurl: old\n\n[authorization]\ncors_domains:\n`

            expect(replaceConfigSection(content, header, null)).toBe(
                '[server]\nhost: 0.0.0.0\n\n[authorization]\ncors_domains:\n'
            )

            // nothing to remove is a no-op, so the caller writes nothing
            const untouched = '[server]\nhost: 0.0.0.0\n'
            expect(replaceConfigSection(untouched, header, null)).toBe(untouched)
        })

        it('matches the header exactly, so a similarly named section survives', () => {
            const content = `[notifier webpush2]\nurl: other\n`

            expect(replaceConfigSection(content, header, section)).toBe(`${content}\n${section}\n`)
        })
    })

    describe('progressSourceFor', () => {
        it('measures by the slicer only when progress is shown by the slicer', () => {
            expect(progressSourceFor('slicer')).toBe('slicer')
        })

        it('uses the file position for every mode the printer cannot measure itself', () => {
            expect(progressSourceFor('file-relative')).toBe('file')
            expect(progressSourceFor('file-absolute')).toBe('file')
            expect(progressSourceFor('filament')).toBe('file')
            expect(progressSourceFor(undefined)).toBe('file')
        })
    })

    describe('buildNotifyCfg', () => {
        it('fills every settings line with a value Klipper can parse', () => {
            const cfg = buildNotifyCfg(25, ['extruder', 'mmu_entry_0'], 'slicer')

            expect(cfg).toContain('variable_progress_interval: 25\n')
            expect(cfg).toContain('variable_progress_source: "slicer"\n')
            expect(cfg).toContain('variable_runout_sensors: "extruder,mmu_entry_0"\n')
            expect(cfg).not.toMatch(/__[A-Z_]+__/)
        })

        it('reads the slicer progress only when display_status exists', () => {
            const cfg = buildNotifyCfg(25, [], 'slicer')

            // a printer without [display] or mainsail.cfg has no display_status,
            // and reading it there would break the macro
            expect(cfg).toContain('{% set use_slicer = source == "slicer" and "display_status" in printer %}')
            expect(cfg).toContain(
                '{% set progress = printer.display_status.progress if use_slicer else printer.virtual_sdcard.progress %}'
            )
        })
    })

    describe('notifyCfgCodeEquals', () => {
        it('treats a different progress source as a settings-only change', () => {
            expect(
                notifyCfgCodeEquals(buildNotifyCfg(25, [], 'slicer'), buildNotifyCfg(10, ['extruder'], 'file'))
            ).toBe(true)
        })

        it('sees a file without the progress source line as different code', () => {
            const current = buildNotifyCfg(25, [], 'file')
            const older = current.replace(/^variable_progress_source:.*\n/m, '')

            expect(notifyCfgCodeEquals(current, older)).toBe(false)
        })
    })

    describe('setNotifyCfgSetting', () => {
        it('rewrites one settings line and leaves every other byte alone', () => {
            const cfg = buildNotifyCfg(25, ['extruder'], 'file')

            expect(setNotifyCfgSetting(cfg, 'progress_source', '"slicer"')).toBe(
                buildNotifyCfg(25, ['extruder'], 'slicer')
            )
        })

        it('leaves a file without that line unchanged', () => {
            const older = buildNotifyCfg(25, [], 'file').replace(/^variable_progress_source:.*\n/m, '')

            expect(setNotifyCfgSetting(older, 'progress_source', '"slicer"')).toBe(older)
            expect(setNotifyCfgSetting('', 'progress_source', '"slicer"')).toBe('')
        })
    })

    describe('toSubscriptionJson', () => {
        it('keeps only the endpoint and keys a push sender needs', () => {
            const subscription = {
                toJSON: () => ({
                    endpoint: 'https://example.test/push/abc',
                    expirationTime: null,
                    keys: { p256dh: 'public-key', auth: 'auth-secret' },
                }),
            } as unknown as PushSubscription

            expect(toSubscriptionJson(subscription)).toEqual({
                endpoint: 'https://example.test/push/abc',
                keys: { p256dh: 'public-key', auth: 'auth-secret' },
            })
        })

        it('falls back to empty strings when the browser omits the keys', () => {
            const subscription = {
                toJSON: () => ({ endpoint: 'https://example.test/push/abc' }),
            } as unknown as PushSubscription

            expect(toSubscriptionJson(subscription)).toEqual({
                endpoint: 'https://example.test/push/abc',
                keys: { p256dh: '', auth: '' },
            })
        })
    })
})
