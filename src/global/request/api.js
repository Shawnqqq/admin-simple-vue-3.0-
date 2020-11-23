const PREFIX = process.env.VUE_APP_API + "/api";
const ADMIN_PREFIX = PREFIX + "/admin";

export default {
  userInfo: `${PREFIX}/web/users/user-info`,

  qiniuUrl: "https://up.qiniup.com",
  qiniuToken: `${PREFIX}/file/qiniu-token`,
  qiniuStore: `${PREFIX}/file/qiniu-store`,

  user: `${ADMIN_PREFIX}/users`,

  permissions: `${ADMIN_PREFIX}/permissions`,
  userPermissions: `${ADMIN_PREFIX}/permissions/my`,

  roles: `${ADMIN_PREFIX}/roles`,
  rolesId: id => `${ADMIN_PREFIX}/roles/${id}`,

  managers: `${ADMIN_PREFIX}/administrators`,
  managersId: id => `${ADMIN_PREFIX}/administrators/${id}`,

  blog: `${ADMIN_PREFIX}/blog`,
  blogId: id => `${ADMIN_PREFIX}/blog/${id}`,

  blogTag: `${ADMIN_PREFIX}/blog-tags`,
  blogTagId: id => `${ADMIN_PREFIX}/blog-tags/${id}`,
  blogTagSort: `${ADMIN_PREFIX}/blog-tags-sort`,
  blogTagStatus: id => `${ADMIN_PREFIX}/blog-tags-status/${id}`,

  blogTagsGroup: `${ADMIN_PREFIX}/blog-tags-group`,
  blogTagsGroupId: id => `${ADMIN_PREFIX}/blog-tags-group/${id}`,
  blogTagsGroupSort: `${ADMIN_PREFIX}/blog-tags-group-sort`
};
