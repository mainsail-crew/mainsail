/// <reference types="vite/client" />

declare module '*.vue' {
    import type { Component } from 'vue'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    const component: Component<{}, {}, any>
    export default component
}
