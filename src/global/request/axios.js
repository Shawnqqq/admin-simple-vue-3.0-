import axios from "axios";
import Cookies from "js-cookie";
import { message } from "ant-design-vue";

const axiosInstance = axios.create();

axiosInstance.defaults.timeout = 20000;

axiosInstance.interceptors.request.use(
  config => {
    const newConfig = { ...config };
    const TOKEN = Cookies.get("x_token");
    if (TOKEN) {
      newConfig.headers.Authorization = `Bearer ${TOKEN}`;
    }
    return newConfig;
  },
  error => Promise.reject(error)
);

const handleErrorRequest = error => {
  const { response } = error;
  const status = response ? response.status : 408;
  if (response) {
    const { data } = response;
    const { errors } = data;
    const msg = data.message || "网络错误";
    if (status === 401) {
      message.error("登录失效，即将跳转前台", 3).then(() => {
        Cookies.remove("x_token", {
          path: "",
          domain: process.env.VUE_APP_DOMAIN
        });
        window.location.href = process.env.VUE_APP_WEB;
      });
    } else if (status === 403) {
      message.error("没有权限，即将跳转前台", 3).then(() => {
        Cookies.remove("x_token", {
          path: "",
          domain: process.env.VUE_APP_DOMAIN
        });
        window.location.href = process.env.VUE_APP_WEB;
      });
    } else if (status === 419) {
      // 页面过期;
      localStorage.clear();
      sessionStorage.clear();
    } else if (status === 422 || status === 423 || status === 429) {
      let errorObj = errors ? errors : data;
      Object.keys(errorObj).forEach(errorKey => {
        const errorValue = errorObj[errorKey].join("\n");
        message.error(errorValue);
      });
    } else {
      message.error(msg);
    }
  } else {
    message.error("网络超时");
  }
};

axiosInstance.interceptors.response.use(
  res => {
    switch (true) {
      case res.data.error_code === 0:
        return res.data.data;
      case res.data.error_code === 1:
        message.error(res.data.msg);
        return Promise.reject(res.data);
      case res.data.code === 200:
        return res.data.data;
      case res.status === 200:
        return res.data;
      default:
        return res.data;
    }
  },
  error => {
    handleErrorRequest(error);
    return Promise.reject(error);
  }
);

export default {
  post(url = "", data = {}, config = {}) {
    return axiosInstance.post(url, data, config);
  },
  put(url = "", data = {}, config = {}) {
    return axiosInstance.put(url, data, config);
  },
  patch(url = "", data = {}, config = {}) {
    return axiosInstance.patch(url, data, config);
  },
  get(url = "", params = {}, config = {}) {
    const OPTIONS = Object.assign({ params }, config);
    return axiosInstance.get(url, OPTIONS);
  },
  delete(url = "", params = {}, config = {}) {
    const OPTIONS = Object.assign({ params }, config);
    return axiosInstance.delete(url, OPTIONS);
  }
};
