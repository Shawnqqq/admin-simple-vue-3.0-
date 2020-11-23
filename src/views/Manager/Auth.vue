<template>
  <div class="page-container">
    <a-card hoverable>
      <p class="page-container-title">管理员可以使用所拥有权限的相关功能</p>
      <div class="auth-container">
        <div class="auth-filter-list">
          <a-select
            :disabled="loading"
            allowClear
            class="auth-filter-item"
            placeholder="权限过滤"
            v-model:value="role"
            @change="filterRole"
          >
            <a-select-option
              v-for="item in constData.permissionGroup"
              :key="item.id"
              :value="item.name"
            >
              {{ item.display_name }}
            </a-select-option>
          </a-select>
          <a-button
            class="auth-filter-insert"
            type="primary"
            @click="handleInsert"
          >
            添加管理员
          </a-button>
        </div>
        <div class="auth-table-container">
          <a-table
            :data-source="tableData"
            :columns="columns"
            :loading="loading"
            :pagination="paginationData"
            @change="handleTableChange"
          >
            <template v-slot:user_id="{ text: user_id }">
              <a-avatar>{{ user_id }}</a-avatar>
            </template>
            <template v-slot:action="{ record, index }">
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
                    <a-menu-divider />
                    <a-menu-item
                      @click="handleDelete(record, index)"
                      :disabled="record.id === 1"
                    >
                      删除
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
import managerService from "@/global/service/manager.js";
import roleService from "@/global/service/role.js";
import { IconPark } from "@icon-park/vue-next/lib/all";

export default {
  components: {
    IconPark
  },
  data() {
    return {
      loading: true,
      role: [],
      tableData: [],
      columns: [
        {
          title: "用户id",
          dataIndex: "user_id",
          slots: { customRender: "user_id" }
        },
        {
          title: "权限组",
          dataIndex: "role",
          ellipsis: true
        },
        {
          title: "操作",
          fixed: "right",
          key: "action",
          slots: { customRender: "action" }
        }
      ],
      paginationData: {
        current: 1,
        pageSize: 15,
        total: 0,
        hideOnSinglePage: true
      },
      constData: {
        permissionGroup: []
      }
    };
  },
  created() {
    this.getManager();
    this.getConst();
  },
  methods: {
    getManager() {
      let params = {
        page: this.paginationData.current,
        page_size: this.paginationData.pageSize
      };
      this.role && this.role.length > 0 ? (params.role_name = this.role) : null;
      managerService
        .list(params)
        .then(res => {
          this.tableData = res.list;
          res.list.forEach(data => {
            data.key = data.id;
            data.role = data.roles.map(arr => arr.display_name).join("、");
          });
          this.paginationData.current = res.pagination.current_page;
          this.paginationData.total = res.pagination.total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getConst() {
      roleService.list().then(data => {
        this.constData.permissionGroup = data;
      });
    },
    filterRole() {
      this.loading = true;
      this.getManager();
    },
    handleInsert() {
      this.$router.push({ name: "ManagerAuthInsert" });
    },
    handleEdit(row) {
      const id = row.id;
      this.$router.push({ name: "ManagerAuthEdit", params: { id } });
    },
    handleDelete(row, index) {
      const id = row.id;
      this.$confirm({
        content: "确认删除该管理员吗？此操作不可逆。",
        onOk: () => {
          managerService.delete(id).then(() => {
            this.$message.success("删除管理员成功");
            this.tableData.splice(index, 1);
          });
        }
      });
    },
    // 表格分页、排序、筛选
    handleTableChange(pagination) {
      this.paginationData.current = pagination.current;
      this.getManager();
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
    .auth-filter-item {
      width: 180px;
    }
  }
  .auth-table-container {
    margin-top: 30px;
  }
}
</style>
