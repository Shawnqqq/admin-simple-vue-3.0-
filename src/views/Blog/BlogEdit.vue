<template>
  <div class="page-container">
    <a-card hoverable>
      <a-spin :spinning="loading">
        <a-form
          :model="form"
          ref="ruleForm"
          :rules="rules"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-form-item label="标题" name="title">
            <a-input v-model:value="form.title" placeholder="请输入标题" />
          </a-form-item>
          <a-form-item label="封面" name="cover_url">
            <a-upload
              name="cover"
              class="cover-uploader"
              list-type="picture-card"
              :show-upload-list="false"
              action=""
              :before-upload="handleBeforeUpload"
              accept="image/jpeg image/gif image/png"
            >
              <img
                class="cover-uploader-img"
                v-if="form.cover_url"
                :src="form.cover_url"
                alt="cover"
              />
              <div v-else>
                <loading-outlined v-if="uploadLoading" />
                <plus-outlined v-else />
                <div class="ant-upload-text">封面上传</div>
              </div>
            </a-upload>
          </a-form-item>
          <a-form-item label="富文本" name="content">
            <rich-text-quill v-model:value="form.content"></rich-text-quill>
          </a-form-item>
          <a-form-item label="标签">
            <a-cascader
              placeholder="选择标签"
              v-model:value="selectTag"
              :options="constData.tagsGroup"
              :fieldNames="{
                value: 'id',
                label: 'name',
                children: 'tags'
              }"
              @change="handleSelectTag"
            ></a-cascader>
            <div>
              <a-tag
                color="blue"
                v-for="tag in form.tag_id"
                :key="tag.id"
                closable
                @close="handleDeleteTag(tag.id)"
              >
                {{ tag.name }}
              </a-tag>
            </div>
          </a-form-item>
          <a-form-item label="展示">
            <a-switch v-model:checked="form.status" />
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
            <a-button type="primary" @click="handleSubmit">
              确定
            </a-button>
          </a-form-item>
        </a-form>
      </a-spin>
    </a-card>
  </div>
</template>

<script>
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons-vue";
import qiniuService from "@/global/service/qiniu";
import blogService from "@/global/service/blog.js";
import RichTextQuill from "@/components/RichTextQuill.vue";

export default {
  components: {
    PlusOutlined,
    LoadingOutlined,
    RichTextQuill
  },
  data() {
    return {
      id: null,
      loading: true,
      uploadLoading: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      rules: {
        title: [{ required: true, message: "请输入标题", trigger: "blur" }],
        cover_url: [{ required: true, message: "请上传封面", trigger: "blur" }],
        content: [{ required: true, message: "请输入内容", trigger: "blur" }]
      },
      form: {
        title: "",
        status: true,
        cover_url: "",
        content: "",
        tag_id: []
      },
      selectTag: null,
      constData: {
        tagsGroup: []
      }
    };
  },
  created() {
    this.id = this.$route.params.id;
    this.getData();
  },
  methods: {
    getData() {
      Promise.all([blogService.id(this.id), blogService.groupList()])
        .then(([info, group]) => {
          this.form.title = info.title;
          this.form.content = info.content;
          this.form.cover_url = info.cover_url;
          this.form.tag_id = info.blog_tags;
          this.form.status = Boolean(info.status);
          group = group.filter(data => data.tags.length > 0);
          this.constData.tagsGroup = group;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleSelectTag(val, option) {
      let tag = option.pop();
      let tagForm = this.form.tag_id;
      if (tagForm.every(data => data.id !== tag.id)) {
        tagForm.push(tag);
      }
      this.selectTag = null;
    },
    handleDeleteTag(id) {
      this.form.tag_id = this.form.tag_id.filter(data => data.id !== id);
    },
    handleSubmit() {
      this.$refs.ruleForm.validate().then(() => {
        let { content, cover_url, status, tag_id, title } = this.form;
        if (tag_id.length < 1) {
          this.$message.error("请至少选择一个标签");
          return;
        }
        if (this.loading) {
          return;
        }
        this.loading = true;
        tag_id = tag_id.map(data => data.id);
        blogService
          .edit(this.id, {
            title,
            content,
            tag_id,
            cover_url,
            status: status === true ? 1 : 0
          })
          .then(() => {
            this.$message.success("编辑成功");
            this.$router.push({ name: "BlogList" });
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },
    handleBeforeUpload(file) {
      if (!file || !this.validateSize(file)) {
        return false;
      }
      const scene = "cover";
      this.uploadLoading = true;
      qiniuService
        .upload({ file, scene }, () => {})
        .then(res => {
          this.form.cover_url = res.path;
        })
        .finally(() => {
          this.uploadLoading = false;
        });
      return false;
    },
    // 验证大小
    validateSize(file, uploadLimit = 2) {
      const size = uploadLimit * 1024 * 1024;
      const fileName = file.name;
      const suffix = fileName.split(".").pop();
      const imageRegex = /(jpeg|jpg|png)/;
      if (file.size > size || !imageRegex.test(suffix)) {
        this.$message.error(
          `请上传不大于 ${uploadLimit} MB 且格式为jpg、jpeg、png 的文件`
        );
        return false;
      }
      return true;
    }
  }
};
</script>

<style lang="less" scoped>
::v-deep(.ant-upload.ant-upload-select-picture-card) {
  width: 148px;
  height: 148px;
}
.cover-uploader > .ant-upload {
  width: 148px;
  height: 148px;
}
.cover-uploader .cover-uploader-img {
  width: 148px;
  height: 148px;
  object-fit: cover;
}
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
