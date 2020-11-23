<template>
  <div class="page-container">
    <div class="introduction-container">
      <div class="introduction-avatar">
        <img
          class="user-avatar"
          :src="
            userAvatar
              ? userAvatar
              : require('@/assets/images/default-avatar.png')
          "
        />
      </div>
      <div>
        <div class="introduction-name">
          {{ time }}，{{ userName }}，祝你开心每一天！
        </div>
        <div class="introduction-desc">
          JikerX 业务组件库。
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "home",
  data() {
    return {
      time: "早安"
    };
  },
  computed: {
    ...mapState(["userName", "userAvatar"])
  },
  created() {
    let now = new Date().getHours();
    switch (true) {
      case now < 6:
        this.time = "凌晨好";
        break;
      case now < 9:
        this.time = "早安";
        break;
      case now < 12:
        this.time = "上午好";
        break;
      case now < 14:
        this.time = "午安";
        break;
      case now < 17:
        this.time = "下午好";
        break;
      case now < 19:
        this.time = "傍晚好";
        break;
      case now < 22:
        this.time = "晚上好";
        break;
      default:
        this.time = "深夜好";
    }
  }
};
</script>

<style lang="less">
.introduction-container {
  margin: 36px 0 24px;
  padding: 8px 16px;
  background-color: #ecf8ff;
  border-left: 5px solid #50bfff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  .introduction-avatar {
    margin-right: 20px;
    img {
      width: 64px;
      height: 64px;
    }
  }
  .introduction-name {
    margin: 12px 0;
    font-size: 20px;
    font-weight: 500;
    line-height: 1.5em;
    color: #333;
  }
  .introduction-desc {
    margin: 12px 0;
    font-size: 14px;
    line-height: 1.5em;
    color: #777;
  }
}
</style>
