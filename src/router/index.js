import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";
import { message } from "ant-design-vue";
import Cookies from "js-cookie";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import Store from "@/store/index";
import userService from "@/global/service/user.js";

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.firstInit = false;

router.beforeEach(async (to, from, next) => {
  NProgress.start();
  if (to.meta.title) document.title = to.meta.title;
  try {
    const TOKEN = Cookies.get("x_token");
    if (!TOKEN) {
      message
        .error("登录失效，即将跳转前台", 3)
        .then(() => (window.location.href = process.env.VUE_APP_WEB));
      return;
    }
    if (!router.firstInit && TOKEN) {
      router.firstInit = true;
      await userService.myPermissions().then(({ permissions }) => {
        Store.commit("setAuthPermissions", permissions);
      });
    }
    next();
  } catch {
    next();
  }
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
