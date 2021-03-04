import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Bmob from "hydrogen-js-sdk";
Bmob.initialize("051d786b208588b1", "172110");
import * as d3 from 'd3';

Vue.prototype.d3 = d3;
Vue.prototype.Bmob = Bmob
Vue.use(ElementUI);
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
