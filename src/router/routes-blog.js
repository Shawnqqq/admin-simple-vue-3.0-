import RouterView from "@/components/RouterView";

import Blog from "@/views/Blog/Blog.vue";
import BlogInsert from "@/views/Blog/BlogInsert.vue";
import BlogEdit from "@/views/Blog/BlogEdit.vue";
import BlogTag from "@/views/Blog/Tag.vue";

export default [
  {
    path: "blog",
    name: "blog",
    component: RouterView,
    redirect: { name: "list" },
    permission: "blog-manage",
    meta: {
      title: "博客中心",
      nav: {
        icon: "Notes",
        title: "博客中心"
      }
    },
    children: [
      {
        path: "list",
        name: "BlogListRoot",
        component: RouterView,
        redirect: { name: "BlogList" },
        meta: {
          breadcrumb: "Blog"
        },
        children: [
          {
            path: "",
            name: "BlogList",
            component: Blog,
            meta: {
              title: "博客中心-博客",
              nav: {
                parent: "blog",
                title: "博客"
              }
            }
          },
          {
            path: "insert",
            name: "BlogInsert",
            component: BlogInsert,
            meta: {
              title: "博客中心-博客-新增",
              nav: {
                parent: "blog",
                key: "BlogList"
              },
              breadcrumb: "Insert"
            }
          },
          {
            path: "edit/:id",
            name: "BlogEdit",
            component: BlogEdit,
            meta: {
              title: "博客中心-博客-编辑",
              nav: {
                parent: "blog",
                key: "BlogList"
              },
              breadcrumb: "Edit"
            }
          }
        ]
      },
      {
        path: "tag",
        name: "BlogTagRoot",
        component: RouterView,
        redirect: { name: "BlogTag" },
        meta: {
          breadcrumb: "Role"
        },
        children: [
          {
            path: "",
            name: "BlogTag",
            component: BlogTag,
            meta: {
              title: "博客中心-标签",
              nav: {
                parent: "blog",
                title: "标签"
              }
            }
          }
        ]
      }
    ]
  }
];
