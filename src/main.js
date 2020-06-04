/* eslint-disable no-unused-vars */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import ElementUI from 'element-ui'
import axios from 'axios'

import 'element-ui/lib/theme-chalk/index.css'
import 'element-ui/lib/theme-chalk/display.css'

import '@/assets/icons'

Vue.config.productionTip = false
Vue.use(ElementUI)

function getHttpHost () {
  return new Promise((resolve, reject) => {
    axios.get('/config.json').then(res => {
      if (process.env.NODE_ENV == 'development') {
        axios.defaults.baseURL = process.env.VUE_APP_API_PATH
      } else {
        axios.defaults.baseURL = res.target
      }
      resolve()
    })
  })
}

getHttpHost().then(() => {
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
})
