export const COLOR_SCHEMES = ['portland', 'hsv', 'spring', 'hot', 'grayscale'] as const
export type ColorScheme = (typeof COLOR_SCHEMES)[number]

export const ORIENTATIONS = ['rightFront', 'leftFront', 'front', 'top'] as const
export type Orientation = (typeof ORIENTATIONS)[number]

export interface GuiHeightmapState {
    activecolorscheme: ColorScheme
    defaultOrientation: Orientation
}
