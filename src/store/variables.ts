import { KlipperRepos, Theme } from '@/store/types'

export const defaultMode = 'dark'
export const defaultTheme = 'mainsail'
export const defaultLogoColor = '#D41216'
export const defaultPrimaryColor = '#2196f3'
export const defaultBigThumbnailBackground = '#1e1e1e'

export const minKlipperVersion = 'v0.11.0-257'
export const minMoonrakerVersion = 'v0.8.0-306'
export const minBrowserVersions = [{ name: 'safari', version: '16.5.2' }]

export const colorArray = ['#F44336', '#8e379d', '#03DAC5', '#3F51B5', '#ffde03', '#009688', '#E91E63']

export const colorHeaterBed = '#2196F3'
export const colorChamber = '#4CAF50'
export const opacityHeaterActive = '99'
export const opacityHeaterInactive = '44'
export const themeDir = '.theme'
export const datasetInterval = 1000
export const datasetTypes = ['temperature', 'target', 'power', 'speed']
export const datasetTypesInPercents = ['power', 'speed']
export const additionalSensors = ['aht10', 'bme280', 'htu21d', 'sgp40', 'sht3x']

/*
 * List of valid gcode file extensions
 */
export const validGcodeExtensions = ['.gcode', '.g', '.gco', '.ufp', '.nc']

/*
 * List of initable server components
 */
export const initableServerComponents = [
    'history',
    'power',
    'updateManager',
    'timelapse',
    'jobQueue',
    'announcements',
    'spoolman',
    'sensor',
]

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
    'spoolman',
    'temperature',
    'webcam',
]

export const thumbnailSmallMin = 30
export const thumbnailSmallMax = 64
export const thumbnailBigMin = 128

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
 * List of all downloadable logfiles
 */
export const genericLogfiles = ['klippy', 'moonraker', 'crowsnest', 'mmu', 'sonar']

/*
 * List of all rollover logfiles
 */
export const rolloverLogfiles = ['klipper', 'moonraker']

/*
 * List of all Themes
 */
export const themes: Theme[] = [
    { name: 'mainsail', displayName: 'Mainsail', colorLogo: defaultLogoColor },
    {
        name: 'klipper',
        displayName: 'Klipper',
        colorLogo: '#b12f35',
        logo: { show: true, light: false },
    },
    {
        name: 'voron',
        displayName: 'Voron Design',
        colorLogo: '#FF2300',
        logo: { show: true, light: false },
    },
    {
        name: 'ldo',
        displayName: 'LDO Motion (Sponsor)',
        colorLogo: '#326799',
        colorPrimary: '#326799',
        logo: { show: true, light: false },
    },
    {
        name: 'yumi',
        displayName: 'YUMI (Sponsor)',
        colorLogo: '#F6CF3D',
        colorPrimary: '#F6CF3D',
        logo: { show: true, light: false },
    },
    {
        name: 'vzbot',
        displayName: 'VzBot',
        colorLogo: '#FF0000',
        logo: { show: true, light: false },
        sidebarBackground: { show: true, light: false },
        css: true,
    },
    {
        name: 'prusa',
        displayName: 'Prusa Research (Sponsor)',
        colorLogo: '#fa6831',
        colorPrimary: '#fa6831',
        logo: { show: true, light: false },
    },
    {
        name: 'btt',
        displayName: 'BigTreeTech (Sponsor)',
        colorLogo: '#ef0025',
        logo: { show: true, light: false },
    },
    {
        name: 'multec',
        displayName: 'Multec GmbH (Sponsor)',
        colorLogo: '#234D7A',
        colorPrimary: '#234D7A',
        logo: { show: true, light: false },
    },
]

/*
 * List of all supported Klipper-Repos
 */
export const klipperRepos: KlipperRepos = {
    Klipper: {
        url: 'https://www.klipper3d.org/',
        docsLanguages: ['it', 'hu', 'zh'],
    },
    Kalico: {
        url: 'https://docs.kalico.gg/',
    },
}
