import Dashboard from '../pages/Dashboard.vue'
//import Status from '../pages/Status.vue'
import Console from '../pages/Console.vue'
import Files from '../pages/Files.vue'
import Settings from '../pages/Settings.vue'
import SettingsGeneral from '../pages/settings/general.vue'
import SettingsMachine from '../pages/settings/machine.vue'

const routes = [
    {
        title: "Dashboard",
        path: '/',
        icon: 'view-dashboard',
        component: Dashboard
    },
    {
        title: "Console",
        path: '/console',
        icon: 'code-tags',
        component: Console
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
        component: Files
    },
    {
        title: "Settings",
        path: '/settings',
        icon: 'wrench',
        component: Settings,
        children: [
            {
                title: 'General',
                path: '/settings/general',
                component: SettingsGeneral
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