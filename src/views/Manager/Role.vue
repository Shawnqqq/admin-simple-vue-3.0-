<template>
  <div class="page-container">
    <a-card hoverable>
      <p class="page-container-title">
        权限组包含多个权限，这些权限可以一次赋予给管理员
      </p>
      <div class="auth-container">
        <div class="auth-filter-list">
          <a-button
            class="auth-filter-insert"
            type="primary"
            @click="handleInsert"
          >
            新增权限组
          </a-button>
        </div>
        <div class="auth-table-container">
          <a-table
            :data-source="tableData"
            :columns="columns"
            :loading="loading"
            :pagination="{ hideOnSinglePage: true }"
            rowKey="id"
          >
            <template v-slot:action="{ record }">
              <a-dropdown placement="bottomRight">
                <a class="ant-dropdown-link">
                  <icon-park
                    type="MoreOne"
                    theme="outline"
                    size="20"
                    fill="#333"
                    :strokeWidth="3"
                  >
                  </icon-park>
                </a>
                <template v-slot:overlay>
                  <a-menu>
                    <a-menu-item @click="handleEdit(record)">
                      编辑
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </template>
          </a-table>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script>
import roleService from "@/global/service/role.js";
import { IconPark } from "@icon-park/vue-next/lib/all";

export default {
  components: {
    IconPark
  },
  data() {
    return {
      loading: true,
      tableData: [],
      columns: [
        {
          title: "展示名称",
          dataIndex: "display_name"
        },
        {
          title: "描述",
          dataIndex: "description",
          ellipsis: true
        },
        {
          title: "操作",
          fixed: "right",
          slots: { customRender: "action" }
        }
      ]
    };
  },
  created() {
    this.getRole();
  },
  methods: {
    getRole() {
      roleService
        .list()
        .then(res => {
          this.tableData = res;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleInsert() {
      this.$router.push({ name: "ManagerRoleInsert" });
    },
    handleEdit(row) {
      const id = row.id;
      this.$router.push({ name: "ManagerRoleEdit", params: { id } });
    }
  }
};
</script>

<style lang="less" scoped>
.auth-container {
  margin-bottom: 60px;
  .auth-filter-list {
    display: flex;
    align-items: center;
    .auth-filter-insert {
      margin-left: auto;
    }
  }
  .auth-table-container {
    margin-top: 30px;
    .table-action {
      color: #1890ff;
      margin-right: 10px;
    }
  }
}
</style>
