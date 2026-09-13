/**
 * Helpers around the Web Push API.
 *
 * Push requires a secure context (https, or localhost during development). On
 * iOS the API additionally only exists once the web app has been added to the
 * home screen, so `PushManager` missing is a normal state to report rather than
 * an error.
 */

export interface WebPushSubscriptionJson {
    endpoint: string
    keys: {
        p256dh: string
        auth: string
    }
}

export const isServiceWorkerSupported = (): boolean => 'serviceWorker' in navigator

export const isPushSupported = (): boolean => isServiceWorkerSupported() && 'PushManager' in window

export const isNotificationSupported = (): boolean => 'Notification' in window

/**
 * True when the app runs as an installed PWA. iOS exposes push only in this
 * mode, so it is worth telling the user about explicitly.
 */
export const isStandalone = (): boolean => {
    const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone
    if (iosStandalone) return true

    return window.matchMedia?.('(display-mode: standalone)').matches ?? false
}

/**
 * VAPID keys are distributed base64url encoded, but `subscribe()` wants the raw
 * bytes of the public key.
 */
export const urlBase64ToUint8Array = (base64String: string): Uint8Array<ArrayBuffer> => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)

    // backed by an explicit ArrayBuffer, as BufferSource does not accept the
    // SharedArrayBuffer that a plain Uint8Array may be typed with
    const output = new Uint8Array(new ArrayBuffer(rawData.length))
    for (let i = 0; i < rawData.length; i++) {
        output[i] = rawData.charCodeAt(i)
    }

    return output
}

export const getRegistration = async (): Promise<ServiceWorkerRegistration | null> => {
    if (!isServiceWorkerSupported()) return null

    return (await navigator.serviceWorker.getRegistration()) ?? null
}

export const getSubscription = async (): Promise<PushSubscription | null> => {
    const registration = await getRegistration()
    if (registration === null) return null

    return await registration.pushManager.getSubscription()
}

export const subscribe = async (vapidPublicKey: string): Promise<PushSubscription> => {
    const registration = await navigator.serviceWorker.ready

    const existing = await registration.pushManager.getSubscription()
    // a subscription made with a different key can never be delivered to, so
    // drop it before subscribing again
    if (existing !== null) await existing.unsubscribe()

    return await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })
}

export const unsubscribe = async (): Promise<boolean> => {
    const subscription = await getSubscription()
    if (subscription === null) return false

    return await subscription.unsubscribe()
}

/**
 * Reduces a PushSubscription to the endpoint/keys pair that push senders need.
 */
export const toSubscriptionJson = (subscription: PushSubscription): WebPushSubscriptionJson => {
    const json = subscription.toJSON()

    return {
        endpoint: json.endpoint ?? '',
        keys: {
            p256dh: json.keys?.p256dh ?? '',
            auth: json.keys?.auth ?? '',
        },
    }
}
