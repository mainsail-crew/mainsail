declare module 'vue-load-image' {
    import { DefineComponent } from 'vue'

    type VueLoadImageComponent = DefineComponent<Record<string, never>, Record<string, never>, unknown>
    const VueLoadImage: VueLoadImageComponent & { default?: VueLoadImageComponent }
    export default VueLoadImage
}
