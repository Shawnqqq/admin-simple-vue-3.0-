import axios from "@/global/request/axios";
import API from "@/global/request/api";

const managerService = {
  list(params) {
    return axios.get(API.managers, params);
  },
  insert(params) {
    return axios.post(API.managers, params);
  },
  id(id) {
    return axios.get(API.managersId(id));
  },
  edit(id, params) {
    return axios.put(API.managersId(id), params);
  },
  delete(id) {
    return axios.delete(API.managersId(id));
  }
};

export default managerService;
