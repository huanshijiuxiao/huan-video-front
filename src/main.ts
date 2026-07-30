import { createApp } from "vue";
import "./style/style.css";
import App from "./App.vue";

// 引入svg插件
import "virtual:svg-icons-register";
import SvgIcon from "@/components/SvgIcon.vue";

// 引入tailwind Css
import "./style/tailwind.css";

// 引入element-plus
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";

import router from "./router";
import { setupStore } from "@/stores";

const app = createApp(App);

app.component("svg-icon", SvgIcon);

setupStore(app);
app.use(router);
app.use(ElementPlus);
app.mount("#app");
