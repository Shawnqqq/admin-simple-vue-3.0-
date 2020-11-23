import axios from "@/global/request/axios";
import API from "@/global/request/api";
import * as qiniu from "qiniu-js";
export default {
  /*
   ** upload(params, progressHandle)
   **
   ** @params space           {string}       空间
   ** @params folder          {string}       文件夹
   ** @params progressHandle  {function}     上传事件回调
   */
  async upload({ bucket, space, file, folder }) {
    const targetBucket = bucket || "public";
    const fileName = file.name;
    // 获取 token
    const tokenInfo = await this.fetchQiNiuToken({
      fileName,
      bucket: targetBucket,
      space: space || "douxi",
      folder: folder || "default"
    });
    // 上传七牛
    const qiniuRes = await this.uploadFileToQiNiu({
      key: tokenInfo.key,
      token: tokenInfo.token,
      file
    });
    // 上报信息
    return await this.sendQiNiuRes({
      name: qiniuRes.fname,
      path: tokenInfo.key
    });
  },
  /* 获取七牛的token和key
   ** @params bucket           {string}       桶
   ** @params fileName         {string}       文件名
   ** @params space            {string}       空间
   ** @params folder           {string}       文件夹
   */
  fetchQiNiuToken({ bucket, fileName, space, folder }) {
    return axios.post(API.qiniuToken, {
      bucket,
      space,
      folder,
      file_name: fileName
    });
  },
  /* 发送文件到七牛上
   ** @params key               {string}       文件名
   ** @params token             {string}       空间
   ** @params file              {string}       文件夹
   ** @params onUploadProgress  {function}     上传回调
   */
  uploadFileToQiNiu({ key, token, file }) {
    const putExtra = {
      fname: "",
      params: {},
      mimeType: ["image/jpeg", "image/png"]
    };
    var config = {
      useCdnDomain: true,
      region: null
    };
    const observable = qiniu.upload(file, key, token, putExtra, config);
    return new Promise(function(resolve, reject) {
      observable.subscribe({
        next() {
          // 上传中的操作
          // console.log('已上传大小，单位为字节：' + res.total.loaded)
          // console.log('本次上传的总量控制信息，单位为字节：' + res.total.size)
          // console.log('当前上传进度，范围：0～100：' + res.total.percent)
        },
        error(err) {
          // 上传失败后的操作
          // console.log(err.code)
          // console.log(err.message)
          // console.log(err.isRequestError)
          // console.log(err.reqId)
          reject(err);
        },
        complete(res) {
          // 完成后的操作
          // 上传成功以后会返回key 和 hash  key就是文件名了！
          // console.log(res)
          resolve(res);
        }
      });
    });
  },
  /* 向服务器发送七牛的响应
   ** @params bucket           {string}       桶
   ** @params path             {string}       地址
   ** @params name             {string}       文件名
   */
  sendQiNiuRes({ bucket, path, name }) {
    return axios.post(API.qiniuStore, {
      bucket,
      path,
      file_name: name.slice(0, name.lastIndexOf("."))
    });
  }
};
