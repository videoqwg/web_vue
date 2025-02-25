<template>
  <div :class="{active:isActive}" class="share-dropdown-menu">
    <div class="share-dropdown-menu-wrapper">
      <span class="share-dropdown-menu-title" @click.self="clickTitle">
        <span style="margin-left: 20px;">{{ title }}</span>
      </span>
      <div
        v-for="(item, index) in items"
        :key="index"
        class="share-dropdown-menu-item"
        @click="handleSelectSession(item.id, 'friend')"
      >
        <div class="menu-item-content">
          <el-avatar
            :src="item.avatar"
            size="medium"
            shape="square"
            style="margin-right: 8px; border-radius: 8px;"
          />
          <span style="font-size: 20px;">{{ item.name }}</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: function() {
        return []
      }
    },
    title: {
      type: String,
      default: 'vue'
    }
  },
  data() {
    return {
      isActive: false
    }
  },
  methods: {
    clickTitle() {
      this.isActive = !this.isActive
    },
    handleSelectSession(sessionId, sessionType) {
      // 触发自定义事件，向父组件传递数据
      this.$emit('session-selected', { sessionId, sessionType })
    }
  }
}
</script>

<style lang="scss" >
$n: 9; //和items.length 相同
$t: .0s;
.share-dropdown-menu {
  width: 250px;
  position: relative;
  z-index: 1;
  height: auto!important;
  &-title {
    width: 100%;
    display: block;
    cursor: pointer;
    background: #409eff;
    color: white;
    height: 60px;
    line-height: 60px;
    font-size: 15px;
    z-index: 2;
    transform: translate3d(0,0,0);
  }
  &-wrapper {
    position: relative;
  }
  &-item {
    text-align: center;
    position: absolute;
    width: 100%;
    background: #e0e0e0;
    color: #000;
    line-height: 60px;
    height: 60px;
    cursor: pointer;
    font-size: 18px;
    overflow: hidden;
    opacity: 1;
    transition: transform 0.28s ease;
    &:hover {
      background: #409eff;
      color: white;
    }
    @for $i from 1 through $n {
      &:nth-of-type(#{$i}) {
        z-index: -1;
        transition-delay: $i*$t;
        transform: translate3d(0, -60px, 0);
      }
    }
  }
  &.active {
    .share-dropdown-menu-wrapper {
      z-index: 1;
    }
    .share-dropdown-menu-item {
      @for $i from 1 through $n {
        &:nth-of-type(#{$i}) {
          transition-delay: ($n - $i)*$t;
          transform: translate3d(0, ($i - 1)*60px, 0);
        }
      }
    }
  }
}
</style>
