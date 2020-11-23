import axios from "@/global/request/axios";
import API from "@/global/request/api";

const roleService = {
  list(params) {
    return axios.get(API.roles, params);
  },
  insert(params) {
    return axios.post(API.roles, params);
  },
  id(id) {
    return axios.get(API.rolesId(id));
  },
  edit(id, params) {
    return axios.put(API.rolesId(id), params);
  },
  delete(id) {
    return axios.delete(API.rolesId(id));
  },
  permissions() {
    return axios.get(API.permissions);
  }
};

export default roleService;
