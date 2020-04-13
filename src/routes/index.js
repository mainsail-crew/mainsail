import Dashboard from '../pages/Dashboard.vue'
//import Status from '../pages/Status.vue'
import Webcam from '../pages/Webcam.vue'
import Console from '../pages/Console.vue'
import Files from '../pages/Files.vue'
import Settings from '../pages/Settings.vue'
import SettingsInterface from '../pages/settings/interface.vue'
import SettingsMachine from '../pages/settings/machine.vue'

const routes = [
    {
        title: "Dashboard",
        path: '/',
        icon: 'view-dashboard',
        component: Dashboard,
    },
    {
        title: "Webcam",
        path: '/webcam',
        icon: 'webcam',
        component: Webcam,
    },
    {
        title: "Console",
        path: '/console',
        icon: 'code-tags',
        component: Console,
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
        icon: 'printer-3d-nozzle',
        component: Files,
    },
    {
        title: "Settings",
        path: '/settings',
        icon: 'wrench',
        component: Settings,
        children: [
            {
                title: 'Interface',
                path: '/settings/interface',
                component: SettingsInterface
            },
            {
                title: 'Machine',
                path: '/settings/machine',
                component: SettingsMachine
            },
        ]
    },

];

export default routes;