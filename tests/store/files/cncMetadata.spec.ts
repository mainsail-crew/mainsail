import { describe, expect, it, vi, afterEach } from 'vitest'
import {
    buildCncMetadataViewModel,
    loadCncMetadata,
    type CncMetadata,
} from '@/store/files/cncMetadata'

afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})

describe('cncMetadata helper', () => {
    it('builds a readable card view model from CNC metadata', () => {
        const metadata: CncMetadata = {
            schema_version: 1,
            cam_tool: 'Fusion 360',
            cam_tool_version: '2.0.18791',
            post_processor: 'MPCNC',
            document: 'pen plotter test v1',
            setup: 'Setup2',
            work_envelope: {
                x_min: 42,
                x_max: 78,
                y_min: 22,
                y_max: 58,
                z_min: -1.5,
                z_max: 16,
            },
            tools: [{ id: 'T0', type: 'flat end mill', diameter_mm: 6 }],
            spindle_rpm: 5000,
            feeds_mm_per_min: { plunge: 333, cut: 1000, rapid: 99999 },
            operation_count: 1,
            operations: [{ name: 'Slot1 - Milling', type: 'adaptive' }],
        }

        const viewModel = buildCncMetadataViewModel(metadata)

        expect(viewModel?.camTool).toBe('Fusion 360')
        expect(viewModel?.tool).toContain('T0')
        expect(viewModel?.tool).toContain('6 mm')
        expect(viewModel?.spindle).toBe('5000 RPM')
        expect(viewModel?.feeds).toContain('333')
        expect(viewModel?.workEnvelope).toContain('X 42')
        expect(viewModel?.fields).toHaveLength(4)
    })

    it('returns null when the sidecar is missing', async () => {
        const fetchMock = vi.fn(async () => ({ ok: false, status: 404 }))
        vi.stubGlobal('fetch', fetchMock)

        const result = await loadCncMetadata('http://localhost:7125', 'test.gcode')

        expect(result).toBeNull()
        expect(fetchMock).toHaveBeenCalledOnce()
    })
})
