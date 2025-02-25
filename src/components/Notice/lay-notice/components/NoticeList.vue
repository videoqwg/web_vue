<template>
  <div>
    <!-- 如果有通知列表 -->
    <div v-if="list.length" class="notice-list">
      <NoticeItem
        v-for="(item, index) in list"
        :key="index"
        :notice-item="item"
      />
    </div>
    <!-- 如果通知列表为空 -->
    <el-empty v-else :description="emptyText" />
  </div>
</template>

<script lang="ts">
import NoticeItem from './NoticeItem.vue'

export default {
  name: 'NoticeList',
  components: {
    NoticeItem
  },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    emptyText: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 16px; /* 每个通知条目之间的间距 */
}
</style>
