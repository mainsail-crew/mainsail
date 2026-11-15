import {
    mdiCalendarClock,
    mdiClockOutline,
    mdiFan,
    mdiLayersTriple,
    mdiPrinter3dNozzle,
    mdiProgressClock,
    mdiRadiator,
    mdiSpeedometer,
    mdiWaterPercent,
} from '@mdi/js'
import { OverlayItemKey, OverlayPosition, WebcamOverlaysConfig } from '@/store/gui/webcams/types'

export const DEFAULT_OVERLAY_POSITION: OverlayPosition = 'bottom-left'
export const DEFAULT_OVERLAY_BACKGROUND = 'rgba(0, 0, 0, 0.7)'

export interface OverlayItemSource {
    value: string
    /** i18n key */
    label: string
}

/**
 * Static description of one overlay item.
 * `group`: 'always' = has a value while idle, 'print' = only during a print.
 * `dummy`: preview value for the settings page.
 */
export interface OverlayItemDefinition {
    key: OverlayItemKey
    icon: string
    /** i18n key of the checkbox label in the webcam settings */
    settingsLabel: string
    /** i18n key of the tooltip / screen reader title on the overlay */
    title: string
    group: 'always' | 'print'
    dummy: string | string[]
    sources?: OverlayItemSource[]
}

/** Rendering order on the overlay and in the settings form. */
export const OVERLAY_ITEMS: OverlayItemDefinition[] = [
    {
        key: 'extruders',
        icon: mdiPrinter3dNozzle,
        settingsLabel: 'Settings.WebcamsTab.OverlayShowExtruders',
        title: 'Panels.WebcamPanel.OverlayExtruders',
        group: 'always',
        dummy: ['E0 215°C / 225°C', 'E1 205°C / 210°C'],
    },
    {
        key: 'heatbed',
        icon: mdiRadiator,
        settingsLabel: 'Settings.WebcamsTab.OverlayShowHeatbed',
        title: 'Panels.WebcamPanel.OverlayHeatbed',
        group: 'always',
        dummy: '60°C / 60°C',
    },
    {
        key: 'fan',
        icon: mdiFan,
        settingsLabel: 'Settings.WebcamsTab.OverlayShowFanSpeed',
        title: 'Panels.WebcamPanel.OverlayFanSpeed',
        group: 'always',
        dummy: '75%',
    },
    {
        key: 'speed',
        icon: mdiSpeedometer,
        settingsLabel: 'Settings.WebcamsTab.OverlayShowSpeed',
        title: 'Panels.WebcamPanel.OverlaySpeed',
        group: 'always',
        dummy: '150 mm/s',
    },
    {
        key: 'flowRate',
        icon: mdiWaterPercent,
        settingsLabel: 'Settings.WebcamsTab.OverlayShowFlowRate',
        title: 'Panels.WebcamPanel.OverlayFlowRate',
        group: 'print',
        dummy: '12.3 mm³/s',
    },
    {
        key: 'printTime',
        icon: mdiClockOutline,
        settingsLabel: 'Settings.WebcamsTab.OverlayShowPrintTime',
        title: 'Panels.WebcamPanel.OverlayPrintTime',
        group: 'print',
        dummy: '1h 23m 45s',
        sources: [
            { value: 'current', label: 'Settings.WebcamsTab.OverlayPrintTimeCurrent' },
            { value: 'total', label: 'Settings.WebcamsTab.OverlayPrintTimeTotal' },
        ],
    },
    {
        key: 'estimate',
        icon: mdiProgressClock,
        settingsLabel: 'Settings.WebcamsTab.OverlayShowEstimate',
        title: 'Panels.WebcamPanel.OverlayEstimate',
        group: 'print',
        dummy: '45m',
        sources: [
            { value: 'avg', label: 'Settings.WebcamsTab.OverlayEstimateAvg' },
            { value: 'slicer', label: 'Settings.WebcamsTab.OverlayEstimateSlicer' },
        ],
    },
    {
        key: 'layerCount',
        icon: mdiLayersTriple,
        settingsLabel: 'Settings.WebcamsTab.OverlayShowLayerCount',
        title: 'Panels.WebcamPanel.OverlayLayerCount',
        group: 'print',
        dummy: '125 / 250',
    },
    {
        key: 'eta',
        icon: mdiCalendarClock,
        settingsLabel: 'Settings.WebcamsTab.OverlayShowEta',
        title: 'Panels.WebcamPanel.OverlayEta',
        group: 'print',
        dummy: '12:34',
    },
]

export interface ResolvedOverlayItem {
    enabled: boolean
    position: OverlayPosition
    /** First entry of the definition's `sources` when unset; undefined for items without sources. */
    source?: string
}

/** Stored config of one item merged with defaults (disabled, bottom-left, first source). */
export function resolveOverlayItem(config: WebcamOverlaysConfig | undefined, key: OverlayItemKey): ResolvedOverlayItem {
    const stored = config?.items?.[key]
    const definition = OVERLAY_ITEMS.find((item) => item.key === key)

    return {
        enabled: stored?.enabled ?? false,
        position: stored?.position ?? DEFAULT_OVERLAY_POSITION,
        source: stored?.source ?? definition?.sources?.[0]?.value,
    }
}
