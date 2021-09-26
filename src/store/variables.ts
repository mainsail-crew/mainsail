export const defaultLogoColor = '#D41216'
export const defaultPrimaryColor = '#2196f3'

export const colorArray = [
    '#F44336',
    '#8e379d',
    '#03DAC5',
    '#3F51B5',
    '#ffde03',
    '#009688',
    '#E91E63',
]

export const colorHeaterBed = '#2196F3'
export const colorChamber = '#4CAF50'
export const themeDir = '.theme'
export const datasetInterval = 1000
export const datasetTypes = [
    'temperature',
    'target',
    'power',
    'speed',
]

export const datasetTypesInPercents = [
    'power',
    'speed',
]

export const additionalSensors = [
    'bme280',
    'htu21d',
]

export const validGcodeExtensions = [
    '.gcode',
    '.g',
    '.gco',
    '.ufp',
    '.nc',
]

export const readOnlyRoots = [
    'config_examples',
    'docs',
    'logs',
]

export const initableServerComponents = [
    'history',
    'power',
    'updateManager',
    'timelapse',
]

export const checkKlipperConfigModules = [
    'virtual_sdcard',
    'pause_resume',
    'display_status',
    'gcode_macro pause',
    'gcode_macro resume',
    'gcode_macro cancel_print',
]

export const allowedMetadata = [
    'estimated_time',
    'filament_total',
    'filament_weight_total',
    'first_layer_bed_temp',
    'first_layer_extr_temp',
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

// timelapse variables
export const timelapseConsoleFilters = [
    '_SET_TIMELAPSE_SETUP',
    'HYPERLAPSE ACTION=',
    'SET_GCODE_VARIABLE MACRO=TIMELAPSE_'
]