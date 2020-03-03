import '@fortawesome/fontawesome-free/css/all.css'
import Vue from 'vue';
import Vuetify, { VSnackbar, VBtn, VIcon } from 'vuetify/lib';
import VuetifyToast from 'vuetify-toast-snackbar'


Vue.use(Vuetify,{
  components: {
    VSnackbar,
    VBtn,
    VIcon,
  }
});

Vue.use(VuetifyToast, {
  x: 'right',
  y: 'bottom',
  timeout: 3000,
});

export default new Vuetify({

  icons: {
    iconfont: 'fa',
  },
});
