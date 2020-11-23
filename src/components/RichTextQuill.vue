<template>
  <div>
    <div ref="editor" :style="{ minHeight: minHeight + 'px' }"></div>
  </div>
</template>

<script>
import Quill from "quill";
import "quill/dist/quill.snow.css";
import qiniuService from "@/global/service/qiniu";
import ImageResize from "quill-image-resize-module";
Quill.register("modules/imageResize", ImageResize);

const uploadConfig = {
  accept: "image/jpeg image/gif image/png",
  uploadLimit: 4096
};
const quillResize = {
  handleStyles: {
    backgroundColor: "black",
    border: "none",
    color: "white"
  },
  modules: ["Resize", "DisplaySize"]
};
const toolbarOptions = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  ["clean"],
  ["link", "image", "video"]
];
const handlers = function(that) {
  return {
    image() {
      const scene = that.scene;
      const folder = that.folder;
      const fileInput = document.createElement("input");
      fileInput.setAttribute("type", "file");
      fileInput.setAttribute("accept", uploadConfig.accept);
      fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        fileInput.value = "";
        if (file.size > uploadConfig.uploadLimit * 1024) {
          if (uploadConfig.uploadLimit < 1024) {
            that.$message.error(
              `请上传不大于 ${uploadConfig.uploadLimit}KB 且格式为jpg、gif、png 的文件`
            );
          } else {
            that.$message.error(
              `请上传不大于 ${uploadConfig.uploadLimit /
                1024}MB 且格式为jpg、gif、png 的文件`
            );
          }
          return;
        }
        qiniuService
          .upload({ folder, scene, file }, () => {})
          .then(res => {
            let length = that.quill.getSelection(true).index;
            that.quill.insertEmbed(length, "image", res.path);
            that.quill.setSelection(length + 1);
          });
      });
      fileInput.click();
    }
  };
};

export default {
  name: "RichTextQuill",
  props: {
    value: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    },
    scene: {
      type: String,
      default: ""
    },
    minHeight: {
      type: Number,
      default: 250
    },
    folder: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      quill: null,
      content: "",
      editorOption: {
        theme: "snow",
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: handlers(this)
          }
        },
        placeholder: "开始编辑..."
      }
    };
  },
  mounted() {
    this.initialize();
  },
  methods: {
    initialize() {
      // option
      if (!this.disabled) {
        this.editorOption.modules.imageResize = quillResize;
      }
      // instance
      this.quill = new Quill(this.$refs.editor, this.editorOption);
      this.quill.enable(true);
      // set content
      if (this.value) {
        this.quill.pasteHTML(this.value);
      }
      // update content
      this.quill.on("text-change", () => {
        let html = this.$refs.editor.children[0].innerHTML;
        if (html === "<p><br></p>") html = "";
        this.content = html;
        this.$emit("update:value", this.content);
      });
      // disabled
      if (!this.disabled) {
        this.quill.enable(true);
      }
    }
  },
  watch: {
    disabled(newVal) {
      if (this.quill) {
        this.quill.enable(!newVal);
      }
    },
    value(newVal) {
      if (this.quill) {
        if (newVal && newVal !== this.content) {
          this.content = newVal;
          this.quill.pasteHTML(newVal);
        } else if (!newVal) {
          this.quill.setText("");
        }
      }
    }
  }
};
</script>
