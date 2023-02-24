import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
// 引入字体包
import './assets/font/iconfont.css'
// 引入全局样式表
import './assets/css/global.less'
// 导入websocket
import SocketService from './utils/socket_service'
// 启动websocket连接
SocketService.Instance.connect()
// 将socketservice实例对象挂载到vue原型对象上
Vue.prototype.$socket = SocketService.Instance
// 将全局的Eacharts的对象挂载到vue的原型对象上
Vue.prototype.$eacharts = window.echarts

// 配置axios请求根本路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/'
// 将axios挂载到Vue原型对象上
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
