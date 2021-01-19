import '@mdi/font/css/materialdesignicons.css'
import Vue from 'vue';
import Vuetify, { VSnackbar, VBtn, VIcon } from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors'

//vue-toast-notification
import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

Vue.use(VueToast, {
  duration: 3000,
})

Vue.use(Vuetify,{
  components: {
    VSnackbar,
    VBtn,
    VIcon,
  }
})

export default new Vuetify({
  theme: {
    themes: {
      light: {
        secondary: colors.grey.lighten3,
        accent: colors.shades.black,
        error: colors.red.accent3,
      },
      dark: {

      }
    }
  },
  icons: {
    iconfont: 'mdi',
  },
})
