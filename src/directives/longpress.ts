import Vue from 'vue'

export type LongpressEvent = Partial<Touch> & { preventDefault: () => void }

type LongpressBinding = ((...args: unknown[]) => void) | { handler: (...args: unknown[]) => void; args: unknown[] }

/**
 * Resolve the callback from the directive binding.
 * Accepts either a plain function or an object `{ handler, args }` where
 * `args` are appended after the event parameter.
 */
function resolveHandler(value: LongpressBinding): (e: LongpressEvent) => void {
    if (typeof value === 'function') return value
    return (e: LongpressEvent) => value.handler(e, ...value.args)
}

Vue.directive('longpress', {
    bind: function (el, binding, vNode) {
        // Make sure expression provided is a function or { handler, args } object
        if (typeof binding.value !== 'function' && typeof binding.value?.handler !== 'function') {
            // Fetch name of component
            const compName = vNode.context?.$options.name
            // pass warning to console
            let warn = `[longpress:] provided expression '${binding.expression}' is not a function or { handler, args } object`
            if (compName) {
                warn += ` Found in component '${compName}' `
            }

            console.warn(warn)
        }

        const debounceTime = Number(binding.arg ?? 1000)

        // Run Function
        const handler = (e: Partial<Touch> & { preventDefault: TouchEvent['preventDefault'] }) => {
            resolveHandler(binding.value)(e)
        }

        // Define variable
        let pressTimer: number | null = null
        let startX = 0
        let startY = 0
        const moveThreshold = 10

        // Define funtion handlers
        // Create timeout ( run function after 1s )
        const start = (e: TouchEvent) => {
            if (e.type === 'click') {
                return
            }

            if (!e.touches || e.touches.length < 1) {
                return
            }

            startX = e.touches[0].clientX
            startY = e.touches[0].clientY

            document
                .querySelector('body')
                ?.setAttribute('style', 'user-select: none; -webkit-user-select: none; -moz-user-select: none;')

            setTimeout(() => {
                document.querySelector('body')?.setAttribute('style', '')
            }, debounceTime + 200)

            if (pressTimer === null) {
                pressTimer = window.setTimeout(() => {
                    // Run function
                    handler({
                        clientX: e.touches[0].clientX,
                        clientY: e.touches[0].clientY,
                        force: e.touches[0].force,
                        identifier: e.touches[0].identifier,
                        pageX: e.touches[0].pageX,
                        pageY: e.touches[0].pageY,
                        radiusX: e.touches[0].radiusX,
                        radiusY: e.touches[0].radiusY,
                        rotationAngle: e.touches[0].rotationAngle,
                        screenX: e.touches[0].screenX,
                        screenY: e.touches[0].screenY,
                        preventDefault: () => e.preventDefault(),
                    })
                }, debounceTime)
            }
            return false
        }

        // Cancel Timeout only if finger moved beyond threshold
        const cancelOnMove = (e: TouchEvent) => {
            if (pressTimer !== null && e.touches?.length) {
                const dx = Math.abs(e.touches[0].clientX - startX)
                const dy = Math.abs(e.touches[0].clientY - startY)
                if (dx < moveThreshold && dy < moveThreshold) return
            }
            cancel()
        }

        // Cancel Timeout
        const cancel = () => {
            if (pressTimer !== null) {
                clearTimeout(pressTimer)
                pressTimer = null
            }
        }

        // Prevent native drag from interrupting the longpress detection.
        // On touch devices, draggable="true" can trigger dragstart which
        // causes a touchcancel, killing the longpress timer.
        const preventDragDuringLongpress = (e: Event) => {
            if (pressTimer !== null) {
                e.preventDefault()
            }
        }

        // Add Event listeners
        el.addEventListener('touchstart', start)
        // Cancel timeouts if these events happen
        el.addEventListener('touchmove', cancelOnMove, { passive: true })
        el.addEventListener('touchend', cancel)
        el.addEventListener('touchcancel', cancel)
        // Block dragstart while longpress timer is running
        el.addEventListener('dragstart', preventDragDuringLongpress)

        document.addEventListener('scroll', cancel, { passive: true })
    },
})
