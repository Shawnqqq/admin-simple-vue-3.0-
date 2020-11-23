<template>
  <div class="page-container">
    <a-card hoverable>
      <div class="auth-title">管理员</div>
      <a-select
        :class="['auth-input', { 'has-error': keyword === 'user_id' }]"
        show-search
        label-in-value
        v-model:value="userSearch"
        placeholder="用户搜索"
        :filter-option="false"
        :not-found-content="fetching ? undefined : null"
        @search="fetchUser"
      >
        <template v-if="fetching" v-slot:notFoundContent>
          <a-spin size="small" />
        </template>
        <a-select-option v-for="user in userData" :key="user.id">
          {{ user.nickname || "-" }} {{ user.phone }}
        </a-select-option>
      </a-select>
      <div class="auth-title">权限</div>
      <a-spin :spinning="loading">
        <div
          :class="[
            'auth-permission-box',
            { 'has-error': keyword === 'role_ids' }
          ]"
        >
          <p class="auth-permission-box-title">权限组</p>
          <p class="auth-permission-desc">
            权限组包含多个权限，这些权限可以一次赋予给管理员
          </p>
          <div class="auth-permission-content">
            <a-checkbox-group v-model:value="permissionGroup">
              <a-checkbox
                v-for="item in constData.permissionGroup"
                :key="item.id"
                :value="item.id"
              >
                <icon-park
                  type="Key"
                  theme="outline"
                  size="14"
                  fill="#333"
                  :strokeWidth="3"
                >
                </icon-park>
                <span class="auth-permission-select">{{
                  item.display_name
                }}</span>
              </a-checkbox>
            </a-checkbox-group>
          </div>
        </div>
        <div class="auth-permission-box group">
          <p class="auth-permission-box-title group">权限</p>
          <div class="permission-item">
            <a-checkbox-group v-model:value="permission">
              <div
                class="permission-item-group"
                v-for="item in constData.permission"
                :key="item.id"
              >
                <p class="permission-item-title">{{ item.display_name }}</p>
                <a-checkbox
                  disabled
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
        @click="handleSubmit"
        :loading="lock"
      >
        确认
      </a-button>
    </a-card>
  </div>
</template>

<script>
import userService from "@/global/service/user.js";
import roleService from "@/global/service/role.js";
import managerService from "@/global/service/manager.js";
import { IconPark } from "@icon-park/vue-next/lib/all";
import validators from "@/utils/validators.js";

export default {
  components: {
    IconPark
  },
  data() {
    return {
      userData: [],
      userSearch: [],
      fetching: false,
      loading: true,
      keyword: null,
      permissionGroup: [],
      lock: false,
      constData: {
        permissionGroup: [],
        permission: []
      },
      timeOut: null
    };
  },
  computed: {
    permission() {
      const group = this.permissionGroup;
      const constGroup = this.constData.permissionGroup;
      let result = [];
      constGroup.forEach(arr => {
        if (group.includes(arr.id)) {
          result = result.concat(arr.permissions.map(data => data.id));
        }
      });
      return [...new Set(result)];
    }
  },
  created() {
    this.getConstData();
  },
  watch: {
    userSearch() {
      this.userData = [];
      this.fetching = false;
    }
  },
  methods: {
    getConstData() {
      Promise.all([roleService.list(), roleService.permissions()])
        .then(([group, permission]) => {
          this.constData.permissionGroup = group;
          this.constData.permission = permission.permission_groups;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    fetchUser(value) {
      clearTimeout(this.timeOut);
      this.timeOut = setTimeout(() => {
        // 节流
        this.fetching = true;
        let parasm = {
          phone: value,
          page_size: 15
        };
        userService
          .list(parasm)
          .then(res => {
            this.userData = res.list;
          })
          .finally(() => {
            this.fetching = false;
          });
      }, 500);
    },
    handleSubmit() {
      let rules = [
        {
          value: this.userSearch.key,
          type: "empty",
          key: "user_id"
        },
        {
          value: this.permissionGroup,
          type: "array",
          key: "role_ids"
        }
      ];
      let valid = validators(rules);
      this.keyword = valid.keyword;
      if (!valid.result) {
        return;
      }
      this.lock = true;
      let params = {
        user_id: this.userSearch.key,
        role_ids: this.permissionGroup
      };
      managerService
        .insert(params)
        .then(() => {
          this.$message.success("新增管理员成功");
          this.$router.push({ name: "ManagerAuth" });
        })
        .finally(() => {
          this.lock = false;
        });
    }
  }
};
</script>

<style lang="less" scoped>
.auth-title {
  margin: 20px 0 10px 0;
  font-size: 15px;
  color: #1f2329;
}
.auth-input {
  display: block;
  margin-top: 8px;
  width: 400px;
  &.has-error {
    ::v-deep(.ant-input) {
      border-color: inherit;
    }
  }
}
.auth-sumbit {
  display: block;
  margin: 20px auto 0 auto;
  width: 150px;
}
.auth-permission-box {
  margin: 8px 0;
  padding: 6px 24px;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
  &.group {
    padding: 8px 0;
  }
  .auth-permission-box-title {
    margin-bottom: 6px;
    font-size: 14px;
    color: #555;
    line-height: 28px;
    &.group {
      padding: 0 24px;
    }
  }
  .auth-permission-desc {
    font-size: 12px;
    color: #888;
    line-height: 24px;
    padding-bottom: 6px;
    border-bottom: 1px solid #dee0e3;
  }
  .auth-permission-select {
    margin-left: 4px;
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
        padding: 0 24px;
        align-items: center;
        border-bottom: 1px solid #dee0e3;
        &:last-child {
          border-bottom: none;
        }
        .ant-checkbox {
          display: block;
          padding: 15px 5px;
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
