import { createApp } from "vue";
const app = createApp();
import App from "./App.vue";
import router from "./router";
import store from "./store";

import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.css";
import "@icon-park/vue-next/styles/index.css";
// 阻止Chrome事件捕获机制 Passive Event Listeners导致的控制台警告
import "default-passive-events";

app.config.productionTip = false;

createApp(App)
  .use(store)
  .use(router)
  .use(Antd)
  .mount("#app");
