<template>
  <div class="page-container">
    <div class="page-flex-container">
      <a-card hoverable class="page-group-section">
        <a-spin :spinning="groupLoading">
          <ul id="page-group-section">
            <li
              :class="[
                'page-group-item',
                { active: group.id === currentGroup }
              ]"
              v-for="(group, index) in groupList"
              :key="group.id"
              @click="handleShowTag(group)"
            >
              <icon-park
                type="Tag"
                theme="outline"
                size="16"
                fill="#3370ff"
                :strokeWidth="4"
              >
              </icon-park>
              <p class="item-group-name">{{ group.name }}</p>
              <div class="item-group-handle">
                <a-dropdown placement="bottomRight">
                  <a class="ant-dropdown-link">
                    <icon-park
                      type="MoreOne"
                      theme="outline"
                      size="24"
                      fill="#3370ff"
                      :strokeWidth="4"
                    >
                    </icon-park>
                  </a>
                  <template v-slot:overlay>
                    <a-menu>
                      <a-menu-item @click="handleGroupEdit(index)">
                        编辑
                      </a-menu-item>
                      <a-menu-divider />
                      <a-menu-item @click="handleGroupDeteil(group, index)">
                        删除
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </li>
            <div class="tag-group-insert-btn" @click="handleTagGroupInsert">
              <icon-park
                type="Plus"
                theme="outline"
                size="14"
                fill="#333"
                :strokeWidth="3"
              >
              </icon-park>
              新增标签组
            </div>
          </ul>
        </a-spin>
        <a-modal
          title="新增标签组"
          v-model:visible="tagGroupInsertVisible"
          :confirmLoading="lock"
          @ok="handleTagGroupInsertSubmit"
        >
          <a-input
            :class="{ 'has-error': keyword === 'tagGroupInsertName' }"
            v-model:value="tagGroupName"
            placeholder="请输入标签组名称"
          />
        </a-modal>
        <a-modal
          title="编辑组标签"
          v-model:visible="tagGroupEditVisible"
          :confirmLoading="lock"
          @ok="handleTagGroupEditSubmit"
        >
          <a-input
            :class="{ 'has-error': keyword === 'tagGroupEditName' }"
            v-model:value="tagGroupName"
            placeholder="请输入标签组名称"
          />
        </a-modal>
      </a-card>
      <a-card hoverable class="page-tag-section">
        <p class="page-container-title">
          标签组包含多个标签，博客可以选择未被禁用的标签；拖拽标签或者标签组进行排序
        </p>
        <a-button
          class="tag-insert-btn"
          type="primary"
          @click="handleTagInsert"
        >
          添加标签
        </a-button>
        <a-table
          :data-source="tagList"
          :columns="columns"
          :loading="tagLoading"
          :pagination="{ hideOnSinglePage: true }"
          rowKey="id"
        >
          <template v-slot:status="{ text: status, record, index }">
            <a-switch
              :loading="lock"
              :checked="!!status"
              @change="handleTagSwitch(record, index)"
            />
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
                  <a-menu-item @click="handleTagEdit(index)">
                    编辑
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item @click="handleTagDelete(record, index)">
                    删除
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </a-table>
        <a-modal
          title="新增标签"
          v-model:visible="tagInsertVisible"
          :confirmLoading="lock"
          @ok="handleTagInsertSubmit"
        >
          <a-input
            :class="{ 'has-error': keyword === 'tagInsertName' }"
            v-model:value="tagName"
            placeholder="请输入标签名称"
          />
        </a-modal>
        <a-modal
          title="编辑标签"
          v-model:visible="tagEditVisible"
          :confirmLoading="lock"
          @ok="handleTagEditSubmit"
        >
          <a-input
            :class="{ 'has-error': keyword === 'tagEditName' }"
            v-model:value="tagName"
            placeholder="请输入标签名称"
          />
        </a-modal>
      </a-card>
    </div>
  </div>
</template>

<script>
import blogService from "@/global/service/blog.js";
import validators from "@/utils/validators.js";
import { IconPark } from "@icon-park/vue-next/lib/all";
import { message, Modal } from "ant-design-vue";
import { formatUTC } from "@/utils/dateTime.js";
import { onMounted, ref } from "vue";
import Sortable from "sortablejs";

export default {
  components: {
    IconPark
  },
  setup() {
    onMounted(() => {
      getGroup();
      let groupElement = document.querySelector("#page-group-section");
      new Sortable(groupElement, {
        animation: 150,
        onUpdate: e => {
          updateGroupSort(e);
        }
      });
      let tagsElement = document.querySelector(".ant-table-wrapper tbody");
      new Sortable(tagsElement, {
        animation: 150,
        onUpdate: e => {
          updateTagSort(e);
        }
      });
    });
    let groupLoading = ref(true);
    let tagLoading = ref(true);
    let groupList = ref([]);
    let tagList = ref([]);
    let currentGroup = ref(0);
    let currentGroupName = ref("");
    let keyword = ref(null);
    let columns = ref([
      {
        title: "名称",
        dataIndex: "name"
      },
      {
        title: "状态",
        dataIndex: "status",
        slots: { customRender: "status" }
      },
      {
        title: "创建时间",
        dataIndex: "created_at",
        ellipsis: true
      },
      {
        title: "最近修改",
        dataIndex: "updated_at",
        ellipsis: true
      },
      {
        title: "操作",
        fixed: "right",
        slots: { customRender: "action" }
      }
    ]);
    let tagSort = ref([]);
    let groupSort = ref([]);
    // 获取标签组、标签
    let getGroup = () => {
      blogService
        .groupList()
        .then(res => {
          currentGroup.value = res[0].id;
          currentGroupName.value = res[0].name;
          groupList.value = res;
          groupSort.value = res.map(data => data.id);
          getTag();
        })
        .finally(() => {
          groupLoading.value = false;
        });
    };
    let getTag = () => {
      tagLoading.value = true;
      let params = {
        group_id: currentGroup.value
      };
      blogService
        .tagList(params)
        .then(res => {
          res.forEach(data => {
            data.created_at = formatUTC(data.created_at);
            data.updated_at = formatUTC(data.updated_at);
          });
          tagList.value = res;
          tagSort.value = res.map(data => data.id);
        })
        .finally(() => {
          tagLoading.value = false;
        });
    };
    // 切换标签组展示标签
    let handleShowTag = e => {
      currentGroup.value = e.id;
      currentGroupName.value = e.name;
      getTag();
    };
    // 标签 相关操作
    let tagInsertVisible = ref(false);
    let tagEditVisible = ref(false);
    let tagName = ref("");
    let tagId = ref(null);
    let lock = ref(false);
    let handleTagSwitch = (record, index) => {
      let boole = Boolean(record.status);
      lock.value = true;
      blogService
        .tagStatus(record.id)
        .then(() => {
          if (boole) {
            tagList.value[index].status = 0;
          } else {
            tagList.value[index].status = 1;
          }
        })
        .finally(() => {
          lock.value = false;
        });
    };
    let handleTagInsert = () => {
      tagName.value = "";
      tagInsertVisible.value = true;
    };
    let handleTagInsertSubmit = () => {
      let valid = validators([
        {
          value: tagName.value,
          type: "empty",
          key: "tagInsertName"
        }
      ]);
      keyword.value = valid.keyword;
      if (!valid.result) {
        return;
      }
      let params = {
        name: tagName.value,
        group_id: currentGroup.value,
        status: 1
      };
      lock.value = true;
      blogService
        .tagInsert(params)
        .then(() => {
          message.success("添加标签成功");
          tagInsertVisible.value = false;
          getTag();
        })
        .finally(() => {
          lock.value = false;
        });
    };
    let handleTagEdit = index => {
      let { id, name } = tagList.value[index];
      tagId.value = id;
      tagName.value = name;
      tagEditVisible.value = true;
    };
    let handleTagEditSubmit = () => {
      let valid = validators([
        {
          value: tagName.value,
          type: "empty",
          key: "tagEditName"
        }
      ]);
      keyword.value = valid.keyword;
      if (!valid.result) {
        return;
      }
      let params = {
        name: tagName.value,
        group_id: currentGroup.value
      };
      lock.value = true;
      blogService
        .tagEdit(tagId.value, params)
        .then(() => {
          message.success("编辑标签成功");
          tagEditVisible.value = false;
          getTag();
        })
        .finally(() => {
          lock.value = false;
        });
    };
    let handleTagDelete = (row, index) => {
      Modal.confirm({
        content: "确认删除该标签吗？此操作不可逆。",
        onOk: () => {
          blogService.tagDelete(row.id).then(() => {
            message.success("删除标签成功");
            tagList.value.splice(index, 1);
          });
        }
      });
    };
    // 标签组 相关操作
    let tagGroupInsertVisible = ref(false);
    let tagGroupEditVisible = ref(false);
    let tagGroupName = ref("");
    let tagGroupId = ref(null);
    let handleTagGroupInsert = () => {
      tagGroupName.value = "";
      tagGroupInsertVisible.value = true;
    };
    let handleTagGroupInsertSubmit = () => {
      let valid = validators([
        {
          value: tagGroupName.value,
          type: "empty",
          key: "tagGroupInsertName"
        }
      ]);
      keyword.value = valid.keyword;
      if (!valid.result) {
        return;
      }
      let params = {
        name: tagGroupName.value
      };
      lock.value = true;
      blogService
        .groupInsert(params)
        .then(() => {
          message.success("添加标签组成功");
          tagGroupInsertVisible.value = false;
          getGroup();
        })
        .finally(() => {
          lock.value = false;
        });
    };
    let handleGroupEdit = index => {
      let { id, name } = groupList.value[index];
      tagGroupId.value = id;
      tagGroupName.value = name;
      tagGroupEditVisible.value = true;
    };
    let handleTagGroupEditSubmit = () => {
      let valid = validators([
        {
          value: tagGroupName.value,
          type: "empty",
          key: "tagGroupEditName"
        }
      ]);
      keyword.value = valid.keyword;
      if (!valid.result) {
        return;
      }
      let params = {
        name: tagGroupName.value
      };
      lock.value = true;
      blogService
        .groupEdit(tagGroupId.value, params)
        .then(() => {
          message.success("编辑标签组成功");
          tagGroupEditVisible.value = false;
          getGroup();
        })
        .finally(() => {
          lock.value = false;
        });
    };
    let handleGroupDeteil = (row, index) => {
      Modal.confirm({
        content: "确认删除该标签组吗？此操作不可逆。",
        onOk: () => {
          blogService.groupDelete(row.id).then(() => {
            message.success("删除标签组成功");
            groupList.value.splice(index, 1);
          });
        }
      });
    };
    // 排序
    let updateGroupSort = e => {
      lock.value = true;
      let group = calculateSort(e, groupSort.value);
      groupSort.value = group;
      blogService
        .groupSort({ sort: group })
        .then()
        .finally(() => {
          lock.value = false;
        });
    };
    let updateTagSort = e => {
      lock.value = true;
      let tag = calculateSort(e, tagSort.value);
      tagSort.value = tag;
      blogService
        .tagSort({ sort: tag })
        .then()
        .finally(() => {
          lock.value = false;
        });
    };
    let calculateSort = (e, array) => {
      // 排序算法
      let temp = array[e.oldIndex];
      array = array.map((data, index, arr) => {
        if (
          e.newIndex > e.oldIndex &&
          index < e.newIndex &&
          index >= e.oldIndex
        ) {
          data = arr[index + 1];
        } else if (
          e.newIndex < e.oldIndex &&
          index <= e.oldIndex &&
          index > e.newIndex
        ) {
          data = arr[index - 1];
        }
        return data;
      });
      array[e.newIndex] = temp;
      return array;
    };
    return {
      groupLoading,
      tagLoading,
      groupList,
      tagList,
      currentGroup,
      currentGroupName,
      keyword,
      columns,
      getGroup,
      getTag,
      handleShowTag,
      tagInsertVisible,
      tagEditVisible,
      handleTagSwitch,
      handleTagInsert,
      handleTagInsertSubmit,
      handleTagEdit,
      handleTagEditSubmit,
      tagName,
      tagId,
      lock,
      handleTagDelete,
      tagGroupInsertVisible,
      tagGroupEditVisible,
      tagGroupName,
      tagGroupId,
      handleTagGroupInsert,
      handleTagGroupInsertSubmit,
      handleGroupEdit,
      handleTagGroupEditSubmit,
      handleGroupDeteil,
      updateGroupSort,
      updateTagSort
    };
  }
};
</script>

<style lang="less" scoped>
.page-flex-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 100%;
  height: calc(100vh - 160px);
  .page-group-section {
    width: 20%;
    height: inherit;
    overflow-y: auto;
    ::v-deep(.ant-card-body) {
      height: 100%;
      padding: 20px 12px;
      .ant-spin-nested-loading {
        height: 100%;
        ::v-deep(.ant-spin) {
          max-height: none;
        }
      }
    }
    .page-group-item {
      margin-bottom: 4px;
      padding: 4px 0 4px 15px;
      display: flex;
      align-items: center;
      cursor: pointer;
      border-radius: 3px;
      .item-group-name {
        flex: 1;
        margin: 0 0 0 6px;
        font-size: 13px;
        color: #3370ff;
      }
      .item-group-handle {
        padding: 0 10px;
        cursor: pointer;
        .i-icon {
          padding-top: 4px;
        }
      }
      &:hover {
        background-color: #ebf3ff;
      }
      &.active {
        background-color: #ebf3ff;
      }
    }
    .tag-group-insert-btn {
      display: flex;
      align-items: center;
      padding: 5px 0 5px 15px;
      cursor: pointer;
      border: 1px solid #dee0e3;
      border-radius: 3px;
      font-size: 13px;
      .i-icon {
        margin-right: 4px;
      }
    }
  }
  .page-tag-section {
    width: 79%;
    height: inherit;
    overflow-y: auto;
    padding: 10px 10px 10px 20px;
    .tag-insert-btn {
      display: block;
      margin: -20px 0 20px auto;
    }
  }
}
</style>
