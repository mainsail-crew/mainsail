import Vue from 'vue';

Vue.directive('longpress', {
    bind: function (el, binding, vNode) {
        // Make sure expression provided is a function
        if (typeof binding.value !== 'function') {
            // Fetch name of component
            const compName = vNode.context.name
            // pass warning to console
            let warn = `[longpress:] provided expression '${binding.expression}' is not a function, but has to be`
            if (compName) { warn += ` Found in component '${compName}' ` }

            console.warn(warn)
        }

        const debounceTime = parseInt(binding.arg ?? 1000);

        // Run Function
        const handler = (e) => {
            binding.value(e)
        }

        // Define variable
        let pressTimer = null

        // Define funtion handlers
        // Create timeout ( run function after 1s )
        let before = null;
        let start = (e) => {
            if ((e.type === 'click' && e.button !== 0)) {
                return;
            }

            if (!e.touches || e.touches.length < 1) {
                return;
            }

            before = document.querySelector('body').getAttribute('style');
            document.querySelector('body').setAttribute('style', (before ?? '') + 'user-select: none; -webkit-user-select: none; -moz-user-select: none;');

            if (pressTimer === null) {
                pressTimer = setTimeout(() => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    e.cancelBubble = true;
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
                        preventDefault: () => e.preventDefault()
                    });
                    setTimeout(() => {
                        if (before) {
                            document.querySelector('body').setAttribute('style', before);
                        }
                    }, 100);
                }, debounceTime);
            }
            return false;
        }

        // Cancel Timeout
        let cancel = () => {
            // Check if timer has a value or not
            if (pressTimer !== null) {
                clearTimeout(pressTimer)
                pressTimer = null
                if (before) {
                    document.querySelector('body').setAttribute('style', before);
                }
                /*console.log(e.type);
                if (e.type === "touchend" && vNode.data.on.click) {
                    vNode.data.on.click();
                }*/
            }
        }

        // Add Event listeners
        // el.addEventListener("mousedown", start);
        el.addEventListener("touchstart", start);
        // Cancel timeouts if this events happen
        //el.addEventListener("click", cancel);
        //el.addEventListener("mouseout", cancel);
        el.addEventListener("touchmove", cancel);
        el.addEventListener("touchend", cancel);
        el.addEventListener("touchcancel", cancel);

        document.addEventListener("scroll", cancel);
    }
});
