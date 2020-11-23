import axios from "@/global/request/axios";
import API from "@/global/request/api";

const blogService = {
  list(params) {
    return axios.get(API.blog, params);
  },
  id(id) {
    return axios.get(API.blogId(id));
  },
  insert(params) {
    return axios.post(API.blog, params);
  },
  edit(id, params) {
    return axios.put(API.blogId(id), params);
  },
  delete(id) {
    return axios.delete(API.blogId(id));
  },
  // 标签
  tagList(params) {
    return axios.get(API.blogTag, params);
  },
  tagInsert(params) {
    return axios.post(API.blogTag, params);
  },
  tagEdit(id, params) {
    return axios.put(API.blogTagId(id), params);
  },
  tagDelete(id) {
    return axios.delete(API.blogTagId(id));
  },
  tagSort(params) {
    return axios.get(API.blogTagSort, params);
  },
  tagStatus(id) {
    return axios.get(API.blogTagStatus(id));
  },
  // 标签组
  groupList(params) {
    return axios.get(API.blogTagsGroup, params);
  },
  groupInsert(params) {
    return axios.post(API.blogTagsGroup, params);
  },
  groupEdit(id, params) {
    return axios.put(API.blogTagsGroupId(id), params);
  },
  groupDelete(id) {
    return axios.delete(API.blogTagsGroupId(id));
  },
  groupSort(params) {
    return axios.get(API.blogTagsGroupSort, params);
  }
};

export default blogService;
