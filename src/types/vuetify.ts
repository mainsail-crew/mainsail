/**
 * Minimal type for Vuetify component refs that expose a focus() method.
 * Use this instead of HTMLInputElement for refs pointing to Vuetify input components
 * like v-text-field, v-textarea, etc.
 */
export type FocusableRef = {
    focus: () => void
}

/**
 * Color object emitted by Vuetify's `v-color-picker` `update:color` event.
 *
 * Re-declared here to avoid importing from `vuetify/src/`, which pulls in
 * uncompiled Vuetify source files and causes TypeScript errors.
 */
export interface VColorPickerColor {
    alpha: number
    hex: string
    hexa: string
    hsla: { h: number; s: number; l: number; a: number }
    hsva: { h: number; s: number; v: number; a: number }
    hue: number
    rgba: { r: number; g: number; b: number; a: number }
}
