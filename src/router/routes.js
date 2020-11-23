import TheLayout from "@/components/TheLayout.vue";

import routesHome from "@/router/routes-home.js";
import routesManager from "@/router/routes-manager.js";
import routerBlog from "@/router/routes-blog.js";

export default [
  {
    path: "/",
    component: TheLayout,
    redirect: { name: "Home" },
    children: [...routesHome, ...routerBlog, ...routesManager]
  }
];
