import { createStore } from "vuex";

export default createStore({
  state: {
    authPermissions: [],
    userName: "未知用户",
    userPhone: "",
    userAvatar: ""
  },
  mutations: {
    setAuthPermissions(state, authPermissions) {
      state.authPermissions = authPermissions;
    },
    setUserName(state, userName) {
      state.userName = userName;
    },
    setUserPhone(state, userPhone) {
      state.userPhone = userPhone;
    },
    setUserAvatar(state, userAvatar) {
      state.userAvatar = userAvatar;
    }
  },
  actions: {},
  modules: {}
});
