import Dashboard from '../pages/Dashboard.vue'
import Webcam from '../pages/Webcam.vue'
import Farm from '../pages/Farm.vue'
import Console from '../pages/Console.vue'
import Heightmap from '../pages/Heightmap.vue'
import Files from '../pages/Files.vue'
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
        alwaysShow: false,
    },
    {
        title: "Console",
        path: '/console',
        icon: 'console-line',
        component: Console,
        alwaysShow: true,
    },
    {
        title: "Heightmap",
        path: '/heightmap',
        icon: 'grid',
        component: Heightmap,
        alwaysShow: false,
    },
    /*{
        title: "Current Job",
        path: '/status',
        icon: 'printer-3d-nozzle',
        component: Status
    },*/
    {
        title: "G-Code Files",
        path: '/files',
        icon: 'file-document-multiple-outline',
        component: Files,
        alwaysShow: false,
    },
    {
        title: "Settings",
        path: '/settings',
        redirect: '/settings/machine',
        icon: 'wrench',
        component: Settings,
        alwaysShow: true,
        children: [
            {
                title: 'Machine',
                path: '/settings/machine',
                component: SettingsMachine,
                alwaysShow: true,
            },
            {
                title: 'Interface',
                path: '/settings/interface',
                component: SettingsInterface,
                alwaysShow: true,
            },
        ]
    },

];

export default routes;