import Vue from 'vue'

/**
 * Load code mirror into a chunk
 */
export default Vue.component(
    'CodemirrorAsync',
    // A dynamic import returns a Promise.
    () => import('@/components/inputs/Codemirror.vue')
)
