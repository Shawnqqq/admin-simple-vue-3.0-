<template>
  <div class="layout-page-container">
    <div
      class="page-left-container"
      :style="[{ width: siderWidth, backgroundColor: navBackgroundColor }]"
    >
      <div class="page-sidebar">
        <div class="sidebar-header">
          <img
            class="sidebar-header-logo"
            :style="collapse ? 'margin-left: 16px' : 'margin-left: 20px'"
            src="@/assets/images/logo.png"
          />
          <span v-show="!collapse" class="sidebar-header-text">Jiker</span>
        </div>
        <div class="sidebar-body">
          <a-menu
            mode="inline"
            theme="dark"
            :inline-collapsed="collapse"
            v-model:selectedKeys="selectedKeys"
            v-model:openKeys="openKeys"
            :inlineIndent="20"
          >
            <template v-for="route in navRoutes">
              <a-menu-item
                v-if="!haveChildren(route)"
                :key="route.name"
                :index="route.name"
                @click="handleRouter(route.name)"
                :title="route.meta.nav.title"
              >
                <icon-park
                  v-if="route.meta.nav.icon"
                  :type="route.meta.nav.icon"
                  theme="outline"
                  size="14"
                >
                </icon-park>
                <span class="collapsed">{{ route.meta.nav.title }}</span>
              </a-menu-item>
              <a-sub-menu
                class="a-sub-menu-level_1"
                v-else
                :key="route.name"
                :index="route.name"
              >
                <template v-slot:title>
                  <icon-park
                    v-if="route.meta.nav.icon"
                    :type="route.meta.nav.icon"
                    theme="outline"
                    size="14"
                  >
                  </icon-park>
                  <span class="collapsed">{{ route.meta.nav.title }}</span>
                </template>
                <template v-for="item in route.children">
                  <a-menu-item
                    v-if="!haveChildren(item)"
                    :key="item.name"
                    :index="item.name"
                    @click="handleRouter(item.name)"
                  >
                    <span>{{ item.meta.nav.title }}</span>
                  </a-menu-item>
                  <a-sub-menu
                    class="a-sub-menu-level_2"
                    v-else
                    :key="item.name"
                    :index="item.name"
                  >
                    <template v-slot:title>
                      <icon-park
                        v-if="route.meta.nav.icon"
                        :type="route.meta.nav.icon"
                        theme="outline"
                        size="14"
                      >
                      </icon-park>
                      <span class="collapsed">{{ item.meta.nav.title }}</span>
                    </template>
                    <a-menu-item
                      v-for="data in item.children"
                      :key="data.name"
                      :index="data.name"
                      @click="handleRouter(item.name)"
                    >
                      <span>{{ data.meta.nav.title }}</span>
                    </a-menu-item>
                  </a-sub-menu>
                </template>
              </a-sub-menu>
            </template>
          </a-menu>
        </div>
      </div>
    </div>
    <div class="page-right-container">
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-header-collapse" @click="handleCollapse">
            <icon-park
              v-show="!collapse"
              type="MenuFold"
              theme="outline"
              size="20"
              fill="#333"
              :strokeWidth="3"
            >
            </icon-park>
            <icon-park
              v-show="collapse"
              type="MenuUnfold"
              theme="outline"
              size="20"
              fill="#333"
              :strokeWidth="3"
            >
            </icon-park>
          </div>
        </div>
        <div class="page-header-middle"></div>
        <div class="page-header-full" @click="handleFullScreen">
          <icon-park
            v-show="!fullscreen"
            type="FullScreen"
            theme="outline"
            size="20"
            fill="#333"
            :strokeWidth="3"
          >
          </icon-park>
          <icon-park
            v-show="fullscreen"
            type="OffScreen"
            theme="outline"
            size="20"
            fill="#333"
            :strokeWidth="3"
          >
          </icon-park>
        </div>
        <a-dropdown style="height: 100%">
          <div class="page-header-right">
            <img
              class="user-avatar"
              :src="
                userAvatar
                  ? userAvatar
                  : require('@/assets/images/default-avatar.png')
              "
            />
            <span class="user-name">{{ userName || userPhone }}</span>
          </div>
          <template v-slot:overlay>
            <a-menu>
              <a-menu-item>
                <div class="page-header-user-item" @click="handleLogout">
                  <icon-park
                    type="Logout"
                    theme="outline"
                    size="14"
                    fill="#333"
                    :strokeWidth="3"
                  >
                  </icon-park>
                  <span>登出</span>
                </div>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <div class="page-content">
        <div class="page-content-banner">
          <a-breadcrumb>
            <a-breadcrumb-item v-for="step in breadcrumb" :key="step.name">
              <router-link :to="{ name: step.name }">
                {{ step.meta.breadcrumb }}
              </router-link>
            </a-breadcrumb-item>
          </a-breadcrumb>
          <p class="page-content-banner-title">{{ routeTitle }}</p>
        </div>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Store from "@/store/index";
import routesAll from "@/router/routes";
import Cookies from "js-cookie";
import { IconPark } from "@icon-park/vue-next/lib/all";
import { ref, computed, onMounted, watchEffect } from "vue";
import { useRouter, useRoute } from "vue-router";

export default {
  name: "shawnLayout",
  components: {
    IconPark
  },
  setup() {
    onMounted(() => {
      getRoutes();
      window.onresize = () => {
        if (!checkFull()) {
          // 退出全屏后要执行的动作
          fullscreen.value = false;
        }
        if (window.innerWidth < 1000) {
          collapse.value = true;
        }
      };
    });
    let navBackgroundColor = ref("#011528");
    let navRoutes = ref([]);
    let collapse = ref(false);
    let fullscreen = ref(false);
    let siderWidth = computed(() => (collapse.value ? "64px" : "227px"));
    const authPermissions = Store.state.authPermissions;
    const userName = Store.state.userName;
    const userPhone = Store.state.userPhone;
    const userAvatar = Store.state.userAvatar;
    // 过滤路由
    let getRoutes = () => {
      let resultRoutes = filterPermissionRoutes(routesAll, authPermissions);
      navRoutes.value = filterRoutes(resultRoutes);
    };
    let filterPermissionRoutes = (routes, permissions) => {
      let filterRoutes = [];
      routes.forEach(data => {
        const route = { ...data };
        const notPermission = !route.permission;
        const hasPermission = permissions.includes(route.permission);
        const passPermission = notPermission || hasPermission;
        let hasPath = true;
        if (route.children) {
          route.children = filterPermissionRoutes(data.children, permissions);
          if (route.children.length === 0) {
            hasPath = false;
          }
        }
        if (passPermission && hasPath) {
          filterRoutes.push(route);
        }
      });
      return filterRoutes;
    };
    let filterRoutes = routes => {
      let result = [];
      routes.forEach(data => {
        if (data.meta && data.meta.nav && data.meta.nav.title) {
          let item = {
            name: data.name,
            meta: data.meta
          };
          if (data.children) {
            item.children = filterRoutes(data.children);
          }
          result.push(item);
        } else if (data.children) {
          filterRoutes(data.children).forEach(item => {
            result.push(item);
          });
        }
      });
      return result;
    };
    let haveChildren = route => {
      let children = route.children || [];
      return children.length;
    };
    // 初始化路由
    const route = useRoute();
    let selectedKeys = ref([]);
    let routeTitle = ref("");
    let openKeys = ref([]);
    let breadcrumb = ref([]);
    watchEffect(() => {
      selectedKeys.value = [route.meta.nav.key || route.name];
      routeTitle.value = route.meta.title;
      openKeys.value = route.meta.nav.parent ? [route.meta.nav.parent] : [];
      breadcrumb.value = route.matched.filter(data => data.meta.breadcrumb);
    });
    // 跳转路由
    const router = useRouter();
    let handleRouter = name => {
      router.push({ name });
    };
    let handleCollapse = () => {
      collapse.value = !collapse.value;
    };
    // 全屏
    let handleFullScreen = () => {
      const docElm = document.documentElement;
      if (fullscreen.value) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } else {
        if (docElm.requestFullscreen) {
          docElm.requestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
          docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) {
          docElm.webkitRequestFullScreen();
        } else if (docElm.msRequestFullscreen) {
          docElm.msRequestFullscreen();
        }
      }
      fullscreen.value = !fullscreen.value;
    };
    // 监听退出全屏事件
    let checkFull = () => {
      let isFull =
        document.mozFullScreen ||
        document.fullScreen ||
        document.webkitIsFullScreen ||
        document.webkitRequestFullScreen ||
        document.mozRequestFullScreen ||
        document.msFullscreenEnabled;
      if (isFull === undefined) {
        isFull = false;
      }
      return isFull;
    };
    // 退出登录
    let handleLogout = () => {
      Cookies.remove("x_token", {
        path: "",
        domain: process.env.VUE_APP_DOMAIN
      });
      window.location.href = process.env.VUE_APP_WEB;
    };

    return {
      navBackgroundColor,
      navRoutes,
      collapse,
      fullscreen,
      siderWidth,
      getRoutes,
      filterPermissionRoutes,
      filterRoutes,
      haveChildren,
      handleRouter,
      selectedKeys,
      openKeys,
      handleCollapse,
      routeTitle,
      authPermissions,
      userName,
      userPhone,
      userAvatar,
      handleFullScreen,
      checkFull,
      breadcrumb,
      handleLogout
    };
  }
};
</script>

<style lang="less" scoped>
.layout-page-container {
  height: 100vh;
  display: flex;
  background-color: #011528;
  .page-left-container {
    flex: none;
    display: flex;
    flex-direction: column;
    transition: all 0.2s ease-out;
    z-index: 3;
    .page-sidebar {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .sidebar-header {
        display: flex;
        align-items: center;
        height: 48px;
        .sidebar-header-logo {
          margin: 8px 8px 8px 20px;
          height: 32px;
          transition: all 0.2s linear;
        }
        .sidebar-header-text {
          flex: 1;
          font-size: 22px;
          color: #fff;
        }
      }
      .sidebar-body {
        flex: 1;
        height: 0;
        overflow: unset;
        ::v-deep(.ant-menu-item) {
          display: flex;
          align-items: center;
        }
        ::v-deep(.i-icon) {
          margin-right: 6px;
        }
        ::v-deep(.ant-menu-inline-collapsed) {
          .collapsed {
            display: none;
          }
        }
        ::v-deep(.ant-menu-inline-collapsed > .ant-menu-item) {
          padding: 0 25px !important;
        }
        ::v-deep(.ant-menu-inline-collapsed
            > .ant-menu-submenu
            > .ant-menu-submenu-title) {
          padding: 0 25px !important;
        }
      }
    }
    .collapse-icon {
      cursor: pointer;
      width: 18px;
      height: 18px;
      font-weight: 500;
      color: #fff;
      margin-right: 12px;
    }
  }
  .page-right-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 1000px;
    overflow: hidden;
    border-radius: 10px 0 0 10px;
    .page-header {
      z-index: 100;
      display: flex;
      justify-content: flex-start;
      padding: 0 20px 0 20px;
      height: 48px;
      font-size: 12px;
      line-height: 48px;
      font-weight: 400;
      color: #606266;
      background: #fff;
      box-shadow: 0 1px 2px 0 rgba(9, 18, 26, 0.06),
        0 4px 8px 0 rgba(39, 56, 73, 0.08);
      .page-header-left {
        display: flex;
        align-items: center;
        .page-header-collapse {
          margin-right: 10px;
          padding: 8px 10px 0 10px;
          cursor: pointer;
          &:hover {
            background: rgba(0, 0, 0, 0.025);
          }
          .collapse-icon {
            width: 18px;
            height: 18px;
            font-weight: 500;
          }
        }
      }
      .page-header-middle {
        flex: 1;
      }
      .page-header-full {
        padding: 2px 12px 0 12px;
        cursor: pointer;
        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
        .full-icon {
          width: 14px;
          height: 14px;
          font-weight: 500;
        }
      }
      .page-header-right {
        display: flex;
        align-items: center;
        flex: none;
        padding: 0 10px;
        height: 100%;
        transition: all 0.2s ease;
        cursor: pointer;
        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
        .user-avatar {
          margin: 0 8px;
          width: 30px;
          height: 30px;
          object-fit: cover;
          border-radius: 50%;
        }
        .user-name {
          margin-right: 8px;
          font-size: 12px;
          vertical-align: middle;
        }
      }
    }
    .page-content {
      position: relative;
      flex: 1;
      overflow-y: auto;
      background: #f0f2f5;
      .page-content-banner {
        background: #fff;
        padding: 15px;
        .page-content-banner-title {
          margin: 5px 0 0 0;
          font-size: 18px;
          color: #333;
        }
      }
    }
  }
}
.page-header-user-item {
  display: flex;
  align-items: center;
  .i-icon {
    margin-right: 8px;
  }
}
</style>
