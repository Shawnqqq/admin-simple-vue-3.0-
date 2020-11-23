<template>
  <div class="page-container">
    <a-card hoverable>
      <div class="auth-role-form">
        <p class="auth-role-form-title">名称</p>
        <a-input
          :class="['auth-role-form-input', { 'has-error': keyword === 'name' }]"
          v-model:value="name"
          placeholder="请输入名称"
        />
      </div>
      <div class="auth-role-form">
        <p class="auth-role-form-title">展示名称</p>
        <a-input
          :class="[
            'auth-role-form-input',
            { 'has-error': keyword === 'display_name' }
          ]"
          v-model:value="display_name"
          placeholder="请输入展示名称"
        />
      </div>
      <div class="auth-role-form">
        <p class="auth-role-form-title">描述</p>
        <a-textarea
          :class="[
            'auth-role-form-input',
            { 'has-error': keyword === 'description' }
          ]"
          v-model:value="description"
          placeholder="请输入描述"
          auto-size
        />
      </div>
      <a-spin :spinning="loading">
        <div
          :class="[
            'auth-permission-box',
            { 'has-error': keyword === 'permission_ids' }
          ]"
        >
          <p class="auth-permission-box-title">权限</p>
          <div class="permission-item">
            <a-checkbox-group v-model:value="permission">
              <div
                class="permission-item-group"
                v-for="item in constData.permission"
                :key="item.id"
              >
                <p class="permission-item-title">{{ item.display_name }}</p>
                <a-checkbox
                  v-for="permission in item.permissions"
                  :key="permission.id"
                  :value="permission.id"
                >
                  <p class="permission-item-name">
                    {{ permission.display_name }}
                  </p>
                </a-checkbox>
              </div>
            </a-checkbox-group>
          </div>
        </div>
      </a-spin>
      <a-button
        class="auth-sumbit"
        type="primary"
        :loading="lock"
        @click="handleSubmit"
      >
        确认
      </a-button>
    </a-card>
  </div>
</template>

<script>
import roleService from "@/global/service/role.js";
import validators from "@/utils/validators.js";

export default {
  data() {
    return {
      loading: true,
      name: "",
      display_name: "",
      description: "",
      permission: [],
      lock: false,
      keyword: false,
      constData: {
        permission: []
      }
    };
  },
  created() {
    this.getConstData();
  },
  methods: {
    getConstData() {
      roleService
        .permissions()
        .then(res => {
          this.constData.permission = res.permission_groups;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleSubmit() {
      let rules = [
        {
          value: this.name,
          type: "empty",
          key: "name"
        },
        {
          value: this.display_name,
          type: "empty",
          key: "display_name"
        },
        {
          value: this.description,
          type: "empty",
          key: "description"
        },
        {
          value: this.permission,
          type: "array",
          key: "permission_ids"
        }
      ];
      let valid = validators(rules);
      this.keyword = valid.keyword;
      if (!valid.result) {
        return;
      }
      this.lock = true;
      let params = {
        name: this.name,
        display_name: this.display_name,
        description: this.description,
        permission_ids: this.permission
      };
      roleService
        .insert(params)
        .then(() => {
          this.$message.success("新增角色成功");
          this.$router.push({ name: "ManagerRole" });
        })
        .finally(() => {
          this.lock = false;
        });
    }
  }
};
</script>

<style lang="less" scoped>
.auth-role-form {
  margin: 20px 0;
  padding: 0 15px;
  display: flex;
  align-items: flex-start;
  .auth-role-form-title {
    width: 80px;
    font-size: 14px;
    color: #333;
  }
  .auth-role-form-input {
    margin-top: 0;
    width: 300px;
  }
}
.auth-sumbit {
  display: block;
  margin: 20px auto 0 auto;
  width: 150px;
}
.auth-permission-box {
  margin: 12px 0;
  padding: 8px 0;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
  .auth-permission-box-title {
    margin-bottom: 6px;
    padding: 0 24px;
    font-size: 14px;
    color: #555;
    line-height: 28px;
  }
  .permission-item {
    ::v-deep(.ant-checkbox-group) {
      width: 100%;
    }
    .permission-item-group {
      display: flex;
      flex-direction: column;
      ::v-deep(.ant-checkbox-wrapper) {
        display: flex;
        margin: 0;
        padding: 15px 24px;
        align-items: center;
        border-bottom: 1px solid #dee0e3;
        &:last-child {
          border-bottom: none;
        }
        .ant-checkbox {
          display: block;
        }
      }
      .permission-item-title {
        margin: 0;
        padding: 0 24px;
        height: 33px;
        font-size: 14px;
        color: #646a73;
        line-height: 33px;
        background-color: #f5f6f7;
      }
      .permission-item-name {
        font-size: 14px;
        font-weight: normal;
        color: #555;
        margin: 0;
      }
    }
  }
}
</style>
