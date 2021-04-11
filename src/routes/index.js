import Dashboard from '../pages/Dashboard.vue'
import Webcam from '../pages/Webcam.vue'
import Farm from '../pages/Farm.vue'
import Console from '../pages/Console.vue'
import Heightmap from '../pages/Heightmap.vue'
import Files from '../pages/Files.vue'
import History from '../pages/History.vue'
import Settings from '../pages/Settings.vue'
import SettingsInterface from '../pages/settings/interface.vue'
import SettingsMachine from '../pages/settings/machine.vue'

const routes = [
    {
        title: "Dashboard",
        path: '/',
        icon: 'monitor-dashboard',
        component: Dashboard,
        alwaysShow: true,
		showInNavi: true,
    },
    {
        title: "Printers",
        path: '/allPrinters',
        component: Farm,
        alwaysShow: false,
    },
    {
        title: "Webcam",
        path: '/cam',
        icon: 'webcam',
        component: Webcam,
        alwaysShow: true,
		showInNavi: true,
    },
    {
        title: "Console",
        path: '/console',
        icon: 'console-line',
        component: Console,
        alwaysShow: true,
		showInNavi: true,
    },
    {
        title: "Heightmap",
        path: '/heightmap',
        icon: 'grid',
        component: Heightmap,
        alwaysShow: false,
		showInNavi: true,
		klipperComponent: 'bed_mesh',
    },
    {
        title: "G-Code Files",
        path: '/files',
        icon: 'file-document-multiple-outline',
        component: Files,
        alwaysShow: false,
		showInNavi: true,
		klipperComponent: 'virtual_sdcard',
    },
    {
        title: "History",
        path: '/history',
        icon: 'history',
        component: History,
        alwaysShow: false,
		showInNavi: true,
		moonrakerComponent: 'history'
    },
    {
        title: "Settings",
        path: '/settings',
        redirect: '/settings/machine',
        icon: 'wrench',
        component: Settings,
        alwaysShow: true,
		showInNavi: true,
        children: [
            {
                title: 'Machine',
                path: '/settings/machine',
                component: SettingsMachine,
                alwaysShow: true,
				showInNavi: true,
            },
            {
                title: 'Interface',
                path: '/settings/interface',
                component: SettingsInterface,
                alwaysShow: true,
				showInNavi: true,
            },
        ]
    },

];

export default routes;
