<template>
  <div class="page-container">
    <a-card hoverable>
      <div class="blog-container">
        <div class="blog-filter-list">
          <a-button
            class="blog-filter-insert"
            type="primary"
            @click="handleInsert"
          >
            添加博客
          </a-button>
        </div>
        <div class="blog-table-container">
          <a-table
            :data-source="tableData"
            :columns="columns"
            :loading="loading"
            :pagination="paginationData"
            @change="handleTableChange"
          >
            <template v-slot:cover_url="{ text: cover }">
              <a-avatar size="large" shape="square" :src="cover" />
            </template>
            <template v-slot:blog_tags="{ text: blog_tags }">
              <span>
                <a-tag v-for="tag in blog_tags" :key="tag.id" color="geekblue">
                  {{ tag.name }}
                </a-tag>
              </span>
            </template>
            <template v-slot:status="{ text: status }">
              <a-badge v-if="status === 1" status="processing" text="展示中" />
              <a-badge v-else status="error" text="已下架" />
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
                    <a-menu-item @click="handleDelete(record, index)">
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
import { IconPark } from "@icon-park/vue-next/lib/all";
import { formatUTC } from "@/utils/dateTime.js";
import blogService from "@/global/service/blog.js";

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
          title: "标题",
          dataIndex: "title",
          ellipsis: true
        },
        {
          title: "封面",
          dataIndex: "cover_url",
          slots: { customRender: "cover_url" }
        },
        {
          title: "标签",
          dataIndex: "blog_tags",
          slots: { customRender: "blog_tags" }
        },
        {
          title: "状态",
          dataIndex: "status",
          slots: { customRender: "status" }
        },
        {
          title: "最近修改",
          dataIndex: "updated_at",
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
      }
    };
  },
  created() {
    this.getData();
  },
  methods: {
    getData() {
      let params = {
        page: this.paginationData.current,
        page_size: this.paginationData.pageSize
      };
      blogService
        .list(params)
        .then(res => {
          res.list.forEach(data => {
            data.key = data.id;
            data.updated_at = formatUTC(data.updated_at);
          });
          this.tableData = res.list;
          this.paginationData.current = res.pagination.current_page;
          this.paginationData.total = res.pagination.total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleInsert() {
      this.$router.push({ name: "BlogInsert" });
    },
    handleEdit(row) {
      const id = row.id;
      this.$router.push({ name: "BlogEdit", params: { id } });
    },
    handleDelete(row, index) {
      const id = row.id;
      this.$confirm({
        content: "确认删除该博客吗？此操作不可逆。",
        onOk: () => {
          blogService.delete(id).then(() => {
            this.$message.success("删除博客成功");
            this.tableData.splice(index, 1);
          });
        }
      });
    },
    // 表格分页、排序、筛选
    handleTableChange(pagination) {
      this.paginationData.current = pagination.current;
      this.getData();
    }
  }
};
</script>

<style lang="less" scoped>
.blog-container {
  margin-bottom: 60px;
  .blog-filter-list {
    display: flex;
    align-items: center;
    .blog-filter-insert {
      margin-left: auto;
    }
  }
  .blog-table-container {
    margin-top: 30px;
  }
}
</style>
