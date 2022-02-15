import Vue from 'vue'

/**
 * Load code mirror into a chunk
 */
export default Vue.component(
    'codemirror-async',
    // A dynamic import returns a Promise.
    () => import('@/components/inputs/Codemirror.vue')
)
