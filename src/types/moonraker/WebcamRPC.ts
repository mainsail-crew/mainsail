/**
 * Webcam Management RPC Interface
 *
 * Moonraker maintains webcam configuration in its database so various applications
 * and front-ends can share this configuration through a consistent interface.
 *
 * Note: Moonraker does not directly manipulate webcams. External applications,
 * such as crowsnest, handle direct webcam functionality.
 *
 * @see https://moonraker.readthedocs.io/en/latest/external_api/webcams/
 */
export interface WebcamRPC {
    /**
     * List webcams.
     * Returns all webcam entries known to Moonraker.
     */
    'server.webcams.list': () => Promise<{
        /** An array of Webcam Entry objects */
        webcams: Webcam[]
    }>

    /**
     * Get webcam information.
     * Returns a single webcam entry, looked up by uid (preferred) or name.
     */
    'server.webcams.get_item': (params: WebcamIdentifier) => Promise<{
        /** A Webcam Entry object for the requested webcam */
        webcam: Webcam
    }>

    /**
     * Add or update a webcam.
     * When updating an entry only the fields provided will be modified.
     * A webcam configured in moonraker.conf cannot be updated or overwritten.
     */
    'server.webcams.post_item': (params: WebcamPostParams) => Promise<{
        /** A Webcam Entry object for the new or updated webcam */
        webcam: Webcam
    }>

    /**
     * Delete a webcam.
     * A webcam configured via moonraker.conf cannot be deleted using this API.
     */
    'server.webcams.delete_item': (params: WebcamIdentifier) => Promise<{
        /** A Webcam Entry object for the deleted webcam */
        webcam: Webcam
    }>

    /**
     * Test a webcam.
     * Resolves a webcam's stream and snapshot urls. If the snapshot is served
     * over http, a test is performed to see if the url is reachable.
     */
    'server.webcams.test': (params: WebcamIdentifier) => Promise<{
        /** The friendly name of the webcam tested */
        name: string
        /** True if Moonraker is able to successfully resolve and connect to the snapshot url */
        snapshot_reachable: boolean
        /** The resolved snapshot url */
        snapshot_url: string
        /** The resolved stream url */
        stream_url: string
    }>
}

/**
 * Webcam Identifier
 *
 * Identifies a webcam by its unique ID. If the uid is omitted the request falls
 * back on looking up the camera by its (deprecated) name.
 */
export type WebcamIdentifier =
    | {
          /** The requested webcam's unique ID */
          uid: string
          /** @deprecated Use uid instead */
          name?: string
      }
    | {
          /** @deprecated Use uid instead */
          name: string
      }

/**
 * Webcam Rotation
 *
 * Clockwise rotation, in degrees, that should be applied to the stream.
 */
export type WebcamRotation = 0 | 90 | 180 | 270

/**
 * Webcam Configuration Source
 *
 * - `database`: Stored in Moonraker's database, may be modified and removed via this API
 * - `config`: Sourced from moonraker.conf, cannot be modified or removed via this API
 */
export type WebcamSource = 'database' | 'config'

/**
 * Webcam Entry
 *
 * Represents a single webcam configuration.
 */
export interface Webcam {
    /** Friendly name of the webcam */
    name: string
    /** A single word description of where the webcam is located or what it is viewing */
    location: string
    /** The name of the webcam streaming service used to operate the webcam */
    service: string
    /** Set to true when the webcam is available, false otherwise */
    enabled: boolean
    /** Name of the icon associated with the webcam */
    icon: string
    /** Target frames per second when the printer is active */
    target_fps: number
    /** Target frames per second when the printer is idle */
    target_fps_idle: number
    /** The url for the webcam's stream request. Maybe a complete url or a url path relative to Moonraker's host */
    stream_url: string
    /** The url for the webcam's snapshot request. Empty string if the webcam does not support a snapshot url */
    snapshot_url: string
    /** A value of true indicates that the stream should be flipped horizontally */
    flip_horizontal: boolean
    /** A value of true indicates that the stream should be flipped vertically */
    flip_vertical: boolean
    /** The amount of clockwise rotation, in degrees, that should be applied to the stream */
    rotation: WebcamRotation
    /** The aspect ratio of the stream in W:H format, for example '4:3' or '16:9' */
    aspect_ratio: string
    /** An object containing custom configuration added by frontends */
    extra_data: Record<string, unknown>
    /** The configuration source of the webcam entry */
    source: WebcamSource
    /** A unique identifier assigned to the webcam entry */
    uid?: string
}

/**
 * Webcam Post Parameters
 *
 * Creating a new entry requires `name` and `stream_url`. Updating an existing
 * entry only requires `uid`, all omitted fields keep their existing value.
 */
export type WebcamPostParams = WebcamOptionalFields &
    (
        | {
              /** The unique ID of the existing Webcam Entry to modify */
              uid: string
              /** The friendly name of the webcam. Each webcam entry must have a unique name */
              name?: string
              /** The url for the webcam's stream request */
              stream_url?: string
          }
        | {
              /** The friendly name of the webcam. Each webcam entry must have a unique name */
              name: string
              /** The url for the webcam's stream request */
              stream_url: string
          }
    )

/**
 * Webcam fields that are optional for both creating and updating an entry.
 * Defaults listed apply to newly created entries.
 */
export interface WebcamOptionalFields {
    /** A single word description of where the webcam is located or what it is viewing (default: 'printer') */
    location?: string
    /** Name of the icon associated with the webcam (default: 'mdiWebcam') */
    icon?: string
    /** Set to true when the webcam is available, false otherwise (default: true) */
    enabled?: boolean
    /** The name of the webcam streaming service used to operate the webcam (default: 'mjpegstreamer') */
    service?: string
    /** Target frames per second when the printer is active (default: 15) */
    target_fps?: number
    /** Target frames per second when the printer is idle (default: 5) */
    target_fps_idle?: number
    /** The url for the webcam's snapshot request (default: '') */
    snapshot_url?: string
    /** A value of true indicates that the stream should be flipped horizontally (default: false) */
    flip_horizontal?: boolean
    /** A value of true indicates that the stream should be flipped vertically (default: false) */
    flip_vertical?: boolean
    /** The amount of clockwise rotation, in degrees, applied to the stream (default: 0) */
    rotation?: WebcamRotation
    /** The aspect ratio of the stream in W:H format (default: '4:3') */
    aspect_ratio?: string
    /** An object containing custom configuration added by frontends (default: {}) */
    extra_data?: Record<string, unknown>
}
