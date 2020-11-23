import RouterView from "@/components/RouterView";

import ManagerAuth from "@/views/Manager/Auth.vue";
import ManagerAuthInsert from "@/views/Manager/AuthInsert.vue";
import ManagerAuthEdit from "@/views/Manager/AuthEdit.vue";
import ManagerRole from "@/views/Manager/Role.vue";
import ManagerRoleInsert from "@/views/Manager/RoleInsert.vue";
import ManagerRoleEdit from "@/views/Manager/RoleEdit.vue";

export default [
  {
    path: "manager",
    name: "manager",
    component: RouterView,
    redirect: { name: "ManagerAuth" },
    permission: "permission-manage",
    meta: {
      title: "管理员中心",
      nav: {
        icon: "People",
        title: "管理员中心"
      }
    },
    children: [
      {
        path: "auth",
        name: "ManagerAuthRoot",
        component: RouterView,
        redirect: { name: "ManagerAuth" },
        meta: {
          breadcrumb: "Auth"
        },
        children: [
          {
            path: "",
            name: "ManagerAuth",
            component: ManagerAuth,
            meta: {
              title: "管理员中心-管理员",
              nav: {
                parent: "manager",
                title: "管理员"
              }
            }
          },
          {
            path: "insert",
            name: "ManagerAuthInsert",
            component: ManagerAuthInsert,
            meta: {
              title: "管理员中心-管理员-新增",
              nav: {
                parent: "manager",
                key: "ManagerAuth"
              },
              breadcrumb: "Insert"
            }
          },
          {
            path: "edit/:id",
            name: "ManagerAuthEdit",
            component: ManagerAuthEdit,
            meta: {
              title: "管理员中心-管理员-编辑",
              nav: {
                parent: "manager",
                key: "ManagerAuth"
              },
              breadcrumb: "Edit"
            }
          }
        ]
      },
      {
        path: "role",
        name: "ManagerRoleRoot",
        component: RouterView,
        redirect: { name: "ManagerRole" },
        meta: {
          breadcrumb: "Role"
        },
        children: [
          {
            path: "",
            name: "ManagerRole",
            component: ManagerRole,
            meta: {
              title: "管理员中心-权限组",
              nav: {
                parent: "manager",
                title: "权限组"
              }
            }
          },
          {
            path: "insert",
            name: "ManagerRoleInsert",
            component: ManagerRoleInsert,
            meta: {
              title: "管理员中心-权限组-新增",
              nav: {
                parent: "manager",
                key: "ManagerRole"
              },
              breadcrumb: "Insert"
            }
          },
          {
            path: "edit",
            name: "ManagerRoleEdit",
            component: ManagerRoleEdit,
            meta: {
              title: "管理员中心-权限组-编辑",
              nav: {
                parent: "manager",
                key: "ManagerRole"
              },
              breadcrumb: "Edit"
            }
          }
        ]
      }
    ]
  }
];
