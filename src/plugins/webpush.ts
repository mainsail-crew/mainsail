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

export interface VapidKeypair {
    /** base64url raw P-256 point, the form `subscribe()` and senders expect */
    publicKey: string
    /** PKCS#8 PEM, the form Apprise's `keyfile=` expects */
    privateKeyPem: string
}

const bytesToBase64 = (bytes: Uint8Array): string => {
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
    }

    return btoa(binary)
}

const toBase64Url = (bytes: Uint8Array): string =>
    bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const toPem = (der: ArrayBuffer): string => {
    const body = bytesToBase64(new Uint8Array(der))
        .replace(/(.{64})/g, '$1\n')
        .trimEnd()

    return `-----BEGIN PRIVATE KEY-----\n${body}\n-----END PRIVATE KEY-----\n`
}

/**
 * Generates the VAPID key pair in the browser, so that enabling notifications
 * needs no key generation script on the host. The private key is PKCS#8 PEM,
 * which is what Apprise loads via `keyfile=`; the public key is the raw curve
 * point both `subscribe()` and the sender derive their identity from.
 */
export const generateVapidKeypair = async (): Promise<VapidKeypair> => {
    const keypair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'])

    const [rawPublicKey, pkcs8PrivateKey] = await Promise.all([
        crypto.subtle.exportKey('raw', keypair.publicKey),
        crypto.subtle.exportKey('pkcs8', keypair.privateKey),
    ])

    return {
        publicKey: toBase64Url(new Uint8Array(rawPublicKey)),
        privateKeyPem: toPem(pkcs8PrivateKey),
    }
}

/**
 * Recovers the public half of a VAPID key pair from its private key.
 *
 * WebCrypto cannot hand back a public key from an imported private one, but a
 * P-256 private key exported as JWK carries the curve point in `x`/`y`, which
 * is the uncompressed point with its leading 0x04 removed. This lets the key
 * pair on the printer stay the single source of truth, with nothing about it
 * duplicated into the settings.
 */
export const derivePublicKeyFromPem = async (pem: string): Promise<string> => {
    const body = pem.replace(/-----[A-Z ]+-----/g, '').replace(/\s+/g, '')
    const der = urlBase64ToUint8Array(body)

    const privateKey = await crypto.subtle.importKey('pkcs8', der, { name: 'ECDSA', namedCurve: 'P-256' }, true, [
        'sign',
    ])

    const jwk = await crypto.subtle.exportKey('jwk', privateKey)
    if (!jwk.x || !jwk.y) throw new Error('private key carries no public point')

    const point = new Uint8Array(65)
    point[0] = 4
    point.set(urlBase64ToUint8Array(jwk.x), 1)
    point.set(urlBase64ToUint8Array(jwk.y), 33)

    return toBase64Url(point)
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

/**
 * Returns `content` with the config section that starts at `header` replaced
 * by `section`, appended when absent, or removed when `section` is null.
 *
 * A section runs from its header line up to the next line beginning with
 * '['. Blank lines that separate it from the next section are left outside
 * the span on a replace, so surrounding spacing survives; on a removal they
 * go with it, so no gap is left behind. Every other byte is preserved.
 */
export const replaceConfigSection = (content: string, header: string, section: string | null): string => {
    const lines = content.split('\n')
    const start = lines.findIndex((line) => line.trim() === header)

    if (start === -1) {
        if (section === null) return content

        const body = content.replace(/\s+$/, '')

        return body === '' ? `${section}\n` : `${body}\n\n${section}\n`
    }

    let next = start + 1
    while (next < lines.length && !lines[next].startsWith('[')) next++

    let end = next
    while (end > start + 1 && lines[end - 1].trim() === '') end--

    if (section === null) lines.splice(start, next - start)
    else lines.splice(start, end - start, ...section.split('\n'))

    return lines.join('\n')
}

/**
 * The Klipper macro file Mainsail installs as webpush/notify.cfg, so push
 * notifications need no hand-placed config. Only the two [gcode_macro
 * _NOTIFY_SETTINGS] variable_ lines vary; buildNotifyCfg fills them in.
 *
 * String.raw keeps Klipper's literal \n as two characters instead of a
 * newline. The text contains no backtick and no ${, so nothing is escaped.
 */
export const NOTIFY_CFG_TEMPLATE: string = String.raw`# Generated by Mainsail (Settings -> Notifications). Hand edits are overwritten.
# Push notifications to every subscribed browser/PWA, via Moonraker's
# [notifier webpush] and the "notify" remote method it registers.

[gcode_macro NOTIFY]
description: Send a custom push notification to every subscribed device
gcode:
    {% if 'MESSAGE' not in params %}
        {action_raise_error("Must provide MESSAGE parameter")}
    {% endif %}
    # Apprise folds the title into the body, and the service worker treats the
    # first line as the title -- so send "title<newline>body" when TITLE is given.
    {% set body = (params.TITLE ~ "\n" ~ params.MESSAGE) if 'TITLE' in params else params.MESSAGE %}
    {action_call_remote_method("notify", name="webpush", message=body)}


# Settings. Mainsail writes them here and also applies them live with
# SET_GCODE_VARIABLE, so a change needs no restart and survives one.

[gcode_macro _NOTIFY_SETTINGS]
variable_progress_interval: __PROGRESS_INTERVAL__
variable_runout_sensors: __RUNOUT_SENSORS__
gcode:
    # holds settings only, never called directly


# Progress notifications. 100 means "completion only", which the
# [notifier webpush] complete event already covers.

[gcode_macro _NOTIFY_PROGRESS_VARS]
variable_last_step: -1
gcode:
    # holds latch state only, never called directly

[delayed_gcode NOTIFY_PROGRESS_CHECK]
initial_duration: 30
gcode:
    {% set interval = printer["gcode_macro _NOTIFY_SETTINGS"].progress_interval|default(25)|int %}
    {% set state = printer.print_stats.state %}
    {% set last_step = printer["gcode_macro _NOTIFY_PROGRESS_VARS"].last_step|int %}

    {% if state == "printing" and interval > 0 and interval < 100 %}
        {% set pct = (printer.virtual_sdcard.progress * 100)|int %}
        {% set step = ((pct / interval)|int) * interval %}
        # 100% is deliberately left to the print-complete notification
        {% if step > last_step and step > 0 and step < 100 %}
            SET_GCODE_VARIABLE MACRO=_NOTIFY_PROGRESS_VARS VARIABLE=last_step VALUE={step}
            NOTIFY TITLE="Print {step}%" MESSAGE="{printer.print_stats.filename}"
        {% endif %}
    {% elif state != "printing" and last_step != -1 %}
        # reset once the job ends, ready for the next print
        SET_GCODE_VARIABLE MACRO=_NOTIFY_PROGRESS_VARS VARIABLE=last_step VALUE=-1
    {% endif %}

    UPDATE_DELAYED_GCODE ID=NOTIFY_PROGRESS_CHECK DURATION=30


# Filament runout. A runout is a present-to-absent transition while a print is
# active, not a static empty reading: when a job starts, every watched sensor
# that is already empty is latched silently, so an MMU's idle gates never fire.
# Each sensor is latched separately and unlatches once filament is seen again,
# so it notifies once per runout and again on a second runout. The watched list
# is a plain comma-separated string.

[gcode_macro _NOTIFY_RUNOUT_VARS]
variable_latched: {}
variable_active: 0
gcode:
    # holds per-sensor latch state and the last-seen print-active flag only,
    # never called directly

[delayed_gcode NOTIFY_RUNOUT_CHECK]
initial_duration: 35
gcode:
    {% set raw = printer["gcode_macro _NOTIFY_SETTINGS"].runout_sensors|default("extruder")|string %}
    {% set names = raw.split(",") %}
    {% set active = printer.print_stats.state in ("printing", "paused") %}
    {% set runout_vars = printer["gcode_macro _NOTIFY_RUNOUT_VARS"] %}
    {% set latched = runout_vars.latched %}
    {% set was_active = runout_vars.active|int %}
    # first tick of a new job: seed the latch from what is already empty
    {% set seeding = active and was_active == 0 %}
    {% set active_flag = 1 if active else 0 %}
    {% set ns = namespace(next={}) %}

    {% if active %}
        {% for raw_name in names %}
            {% set name = raw_name|trim %}
            {% set switch_key = "filament_switch_sensor " ~ name %}
            {% set motion_key = "filament_motion_sensor " ~ name %}
            {% set key = switch_key if switch_key in printer else (motion_key if motion_key in printer else "") %}

            {% if name != "" and key != "" and (printer[key].enabled|default(true)) and not printer[key].filament_detected %}
                {% if not seeding and latched.get(name, 0)|int == 0 %}
                    NOTIFY TITLE="Filament runout" MESSAGE="{name} reports no filament"
                {% endif %}
                {% set _ = ns.next.update({name: 1}) %}
            {% endif %}
        {% endfor %}
    {% endif %}

    # a sensor that reads filament again drops out of the latch, so a second
    # runout fires again; once the job ends the latch empties for the next one
    {% if ns.next != latched %}
        SET_GCODE_VARIABLE MACRO=_NOTIFY_RUNOUT_VARS VARIABLE=latched VALUE="{ns.next}"
    {% endif %}
    {% if active_flag != was_active %}
        SET_GCODE_VARIABLE MACRO=_NOTIFY_RUNOUT_VARS VARIABLE=active VALUE={active_flag}
    {% endif %}

    UPDATE_DELAYED_GCODE ID=NOTIFY_RUNOUT_CHECK DURATION=15
`

/**
 * Renders the macro file for the current settings. The interval is a bare
 * integer; the sensor list is a double-quoted Klipper string literal, which
 * is what ast.literal_eval expects on the variable_ line.
 */
export const buildNotifyCfg = (progressInterval: number, runoutSensors: string[]): string =>
    NOTIFY_CFG_TEMPLATE.replace('__PROGRESS_INTERVAL__', String(Math.trunc(progressInterval))).replace(
        '__RUNOUT_SENSORS__',
        JSON.stringify(runoutSensors.join(','))
    )

const notifyCfgSettingsLine = /^(variable_(?:progress_interval|runout_sensors)):.*$/gm

/**
 * Compares two notify.cfg texts ignoring the settings lines. Equal means only
 * settings differ -- SET_GCODE_VARIABLE has already applied those live, so no
 * FIRMWARE_RESTART is owed. Different means the macro code itself changed.
 */
export const notifyCfgCodeEquals = (a: string, b: string): boolean =>
    a.replace(notifyCfgSettingsLine, '$1:') === b.replace(notifyCfgSettingsLine, '$1:')
