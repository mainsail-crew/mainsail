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
	"temperature",
	"target",
    "power",
	"speed",
]

export const datasetTypesInPercents = [
	"power",
	"speed",
]

export const additionalSensors = [
	"bme280",
	"htu21d",
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
	'update_manager',
]

export const checkKlipperConfigModules = [
	'virtual_sdcard',
	'pause_resume',
	'display_status',
	'gcode_macro pause',
	'gcode_macro resume',
	'gcode_macro cancel_print',
]