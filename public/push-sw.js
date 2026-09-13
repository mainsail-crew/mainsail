/**
 * Web Push handlers for Mainsail.
 *
 * This file is pulled into the generated Workbox service worker through
 * `workbox.importScripts` in vite.config.ts, which hashes its contents into the
 * import URL -- Workbox leaves imported scripts out of the precache manifest,
 * so that hash is what makes an edit here reach clients that already have a
 * service worker installed.
 *
 * Payloads are sent by Moonraker's [notifier] through Apprise's `vapid://`
 * plugin. That plugin sets `title_maxlen = 0`, which makes Apprise fold the
 * title into the body and put a plain string on the wire -- not JSON. JSON is
 * still accepted so other senders keep working.
 */

const MAINSAIL_NOTIFICATION_DEFAULTS = {
    title: 'Mainsail',
    icon: '/img/icons/icon-192.png',
    badge: '/img/icons/icon-192-maskable.png',
    tag: 'mainsail',
}

const parsePushPayload = (event) => {
    if (!event.data) return { title: MAINSAIL_NOTIFICATION_DEFAULTS.title, body: '' }

    // senders that speak JSON get their fields used directly
    try {
        const data = event.data.json()
        if (data && typeof data === 'object') {
            return {
                title: data.title || MAINSAIL_NOTIFICATION_DEFAULTS.title,
                body: data.body ?? data.message ?? '',
                url: data.url,
                tag: data.tag,
            }
        }
    } catch {
        // not JSON -- fall through to the plain text handling below
    }

    const text = (event.data.text() ?? '').trim()
    if (!text) return { title: MAINSAIL_NOTIFICATION_DEFAULTS.title, body: '' }

    // Apprise prepends the title to the body, so with more than one line the
    // first one is the title.
    const [firstLine, ...rest] = text.split(/\r?\n/)
    if (rest.length) return { title: firstLine, body: rest.join('\n').trim() }

    return { title: MAINSAIL_NOTIFICATION_DEFAULTS.title, body: firstLine }
}

self.addEventListener('push', (event) => {
    const { title, body, url, tag } = parsePushPayload(event)

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon: MAINSAIL_NOTIFICATION_DEFAULTS.icon,
            badge: MAINSAIL_NOTIFICATION_DEFAULTS.badge,
            tag: tag ?? MAINSAIL_NOTIFICATION_DEFAULTS.tag,
            renotify: true,
            timestamp: Date.now(),
            data: { url: url ?? '/' },
        })
    )
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    const target = event.notification.data?.url ?? '/'

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // focus an already open Mainsail instead of opening a second one
            for (const client of clientList) {
                if ('focus' in client) return client.focus()
            }

            return self.clients.openWindow(target)
        })
    )
})
