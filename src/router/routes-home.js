import Home from "@/views/Home.vue";

export default [
  {
    path: "/",
    name: "Home",
    component: Home,
    permission: "dashboard-manage",
    meta: {
      title: "主页",
      nav: {
        icon: "Home",
        title: "主页"
      },
      breadcrumb: "Home"
    }
  }
];
