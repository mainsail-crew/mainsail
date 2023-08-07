export const defaultLogoColor = '#D41216'
export const defaultPrimaryColor = '#2196f3'

export const minKlipperVersion = 'v0.11.0-97'
export const minMoonrakerVersion = 'v0.8.0-38'

export const colorArray = ['#F44336', '#8e379d', '#03DAC5', '#3F51B5', '#ffde03', '#009688', '#E91E63']

export const colorHeaterBed = '#2196F3'
export const colorChamber = '#4CAF50'
export const opacityHeaterActive = '99'
export const opacityHeaterInactive = '44'
export const themeDir = '.theme'
export const datasetInterval = 1000
export const datasetTypes = ['temperature', 'target', 'power', 'speed']
export const datasetTypesInPercents = ['power', 'speed']
export const additionalSensors = ['bme280', 'aht10', 'htu21d']

/*
 * List of valid gcode file extensions
 */
export const validGcodeExtensions = ['.gcode', '.g', '.gco', '.ufp', '.nc']

/*
 * List of initable server components
 */
export const initableServerComponents = ['history', 'power', 'updateManager', 'timelapse', 'jobQueue', 'announcements']

/*
 * List of required klipper config modules
 */
export const checkKlipperConfigModules = [
    'virtual_sdcard',
    'pause_resume',
    'gcode_macro pause',
    'gcode_macro resume',
    'gcode_macro cancel_print',
]

/*
 * List of allowed metadata fields
 */
export const allowedMetadata = [
    'uuid',
    'estimated_time',
    'filament_name',
    'filament_type',
    'filament_total',
    'filament_weight_total',
    'nozzle_diameter',
    'first_layer_bed_temp',
    'first_layer_extr_temp',
    'chamber_temp',
    'first_layer_height',
    'gcode_end_byte',
    'gcode_start_byte',
    'job_id',
    'layer_height',
    'object_height',
    'print_start_time',
    'size',
    'slicer',
    'slicer_version',
    'thumbnails',
]

export const maxEventHistory = 500
export const maxGcodeHistory = 50

/*
 * List of generic dashboard panels
 */
export const allDashboardPanels = [
    'toolhead-control',
    'extruder-control',
    'macros',
    'machine-settings',
    'miniconsole',
    'miscellaneous',
    'temperature',
    'webcam',
]

export const thumbnailSmallMin = 32
export const thumbnailSmallMax = 64
export const thumbnailBigMin = 256

export const navigationWidth = 220
export const navigationItemHeight = 48
export const panelToolbarHeight = 48
export const topbarHeight = 48

/*
 * List of hidden timelapse console outputs
 */
export const timelapseConsoleFilters = [
    '^_TIMELAPSE_NEW_FRAME',
    '^TIMELAPSE_TAKE_FRAME',
    '^TIMELAPSE_RENDER',
    '^_SET_TIMELAPSE_SETUP',
    '^HYPERLAPSE ACTION=',
    '^SET_GCODE_VARIABLE MACRO=TIMELAPSE_',
]

/*
 * List of hidden root directories in config files panel
 */
export const hiddenRootDirectories = ['gcodes', 'timelapse', 'timelapse_frames']

/*
 * Hide directories
 */
export const hiddenDirectories = ['.git']

/*
 * List of available Klipper config reference translations
 * https://www.klipper3d.org/Config_Reference.html
 */
export const availableKlipperConfigReferenceTranslations = ['it', 'hu', 'zh']

/*
 * List of all rollover logfiles
 */
export const rolloverLogfiles = ['klipper', 'moonraker']
