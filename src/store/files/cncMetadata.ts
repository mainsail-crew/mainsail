import { escapePath } from '@/plugins/helpers'

export interface CncMetadataWorkEnvelope {
    x_min?: number
    x_max?: number
    y_min?: number
    y_max?: number
    z_min?: number
    z_max?: number
}

export interface CncMetadataTool {
    id?: string
    type?: string
    diameter_mm?: number
}

export interface CncMetadataFeeds {
    plunge?: number
    cut?: number
    rapid?: number
}

export interface CncMetadataOperation {
    name?: string
    type?: string
}

export interface CncMetadata {
    schema_version: number
    cam_tool?: string
    cam_tool_version?: string
    post_processor?: string
    document?: string
    setup?: string
    work_envelope?: CncMetadataWorkEnvelope
    tools?: CncMetadataTool[]
    spindle_rpm?: number
    feeds_mm_per_min?: CncMetadataFeeds
    operation_count?: number
    operations?: CncMetadataOperation[]
}

export interface CncMetadataCardField {
    label: string
    value: string
}

export interface CncMetadataViewModel {
    camTool: string
    workEnvelope: string
    tool: string
    spindle: string
    feeds: string
    plungeFeed: string
    cutFeed: string
    rapidFeed: string
    fields: CncMetadataCardField[]
}

function formatNumber(value: number): string {
    if (!Number.isFinite(value)) return '--'
    return Number.isInteger(value) ? `${value}` : `${value}`.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')
}

function formatRange(axis: 'X' | 'Y' | 'Z', minValue?: number, maxValue?: number): string {
    if (minValue === undefined && maxValue === undefined) return `${axis} --`
    const minText = minValue === undefined ? '--' : formatNumber(minValue)
    const maxText = maxValue === undefined ? '--' : formatNumber(maxValue)
    return `${axis} ${minText} → ${maxText}`
}

function formatTool(tool?: CncMetadataTool): string {
    if (!tool) return '--'
    const parts = [tool.id, tool.type, tool.diameter_mm === undefined ? null : `${formatNumber(tool.diameter_mm)} mm`].filter(
        Boolean
    )
    return parts.length ? parts.join(' · ') : '--'
}

function formatFeeds(feeds?: CncMetadataFeeds): string {
    if (!feeds) return '--'
    const parts = [
        feeds.plunge === undefined ? null : `Plunge ${formatNumber(feeds.plunge)}`,
        feeds.cut === undefined ? null : `Cut ${formatNumber(feeds.cut)}`,
        feeds.rapid === undefined ? null : `Rapid ${formatNumber(feeds.rapid)}`,
    ].filter(Boolean)
    if (!parts.length) return '--'
    return `${parts.join(' · ')} mm/min`
}

export function buildCncMetadataViewModel(metadata: CncMetadata | null | undefined): CncMetadataViewModel | null {
    if (!metadata) return null

    const tool = metadata.tools?.[0]
    const envelope = metadata.work_envelope

    return {
        camTool: metadata.cam_tool ?? '--',
        workEnvelope: envelope
            ? [
                  formatRange('X', envelope.x_min, envelope.x_max),
                  formatRange('Y', envelope.y_min, envelope.y_max),
                  formatRange('Z', envelope.z_min, envelope.z_max),
              ].join(' · ')
            : '--',
        tool: formatTool(tool),
        spindle: metadata.spindle_rpm === undefined ? '--' : `${formatNumber(metadata.spindle_rpm)} RPM`,
        feeds: formatFeeds(metadata.feeds_mm_per_min),
        plungeFeed: metadata.feeds_mm_per_min?.plunge === undefined ? '--' : `${formatNumber(metadata.feeds_mm_per_min.plunge)} mm/min`,
        cutFeed: metadata.feeds_mm_per_min?.cut === undefined ? '--' : `${formatNumber(metadata.feeds_mm_per_min.cut)} mm/min`,
        rapidFeed: metadata.feeds_mm_per_min?.rapid === undefined ? '--' : `${formatNumber(metadata.feeds_mm_per_min.rapid)} mm/min`,
        fields: [
            { label: 'Work Envelope', value: envelope ? formatRange('X', envelope.x_min, envelope.x_max) : '--' },
            { label: 'Tool', value: formatTool(tool) },
            {
                label: 'Spindle',
                value: metadata.spindle_rpm === undefined ? '--' : `${formatNumber(metadata.spindle_rpm)} RPM`,
            },
            { label: 'Feeds', value: formatFeeds(metadata.feeds_mm_per_min) },
        ],
    }
}

export async function loadCncMetadata(apiUrl: string, filename: string): Promise<CncMetadata | null> {
    const url = `${apiUrl}/server/files/gcodes/${escapePath(filename)}.cnc-meta.json`

    try {
        const response = await fetch(url)
        if (!response.ok) return null
        const payload = (await response.json()) as unknown
        if (!payload || typeof payload !== 'object') return null
        return payload as CncMetadata
    } catch {
        return null
    }
}
