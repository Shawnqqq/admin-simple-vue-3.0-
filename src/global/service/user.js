import axios from "@/global/request/axios";
import API from "@/global/request/api";

const userService = {
  list(params) {
    return axios.get(API.user, params);
  },
  myPermissions() {
    return axios.get(API.userPermissions);
  }
};

export default userService;
