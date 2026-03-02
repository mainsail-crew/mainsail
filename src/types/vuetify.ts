/**
 * Minimal type for Vuetify component refs that expose a focus() method.
 * Use this instead of HTMLInputElement for refs pointing to Vuetify input components
 * like v-text-field, v-textarea, etc.
 */
export type FocusableRef = {
    focus: () => void
}
