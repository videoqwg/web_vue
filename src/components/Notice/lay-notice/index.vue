<template>
  <el-dropdown trigger="click" placement="bottom-end">
    <span :class="['dropdown-badge', 'navbar-bg-hover', 'select-none', Number(noticesNum) !== 0 && 'mr-[10px]']">
      <span class="header-notice-icon">
        <svg-icon class-name="message-icon" icon-class="message" />
        <!--这里由于全局样式设置的原因，只能手动调整标记的位置，否则标记无法在图标的右上角-->
        <el-badge :value="Number(noticesNum) === 0 ? '' : noticesNum" :max="99" style="margin-left: -5px;margin-top: -10px;" />
      </span>
    </span>
    <el-dropdown-menu slot="dropdown">
      <el-tabs v-model="activeKey" :stretch="true" class="dropdown-tabs" :style="{ width: notices.length === 0 ? '200px' : '330px' }">
        <template v-for="item in notices">
          <el-tab-pane :key="item.key" :label="getLabel(item)" :name="`${item.key}`">

            <el-scrollbar style="height: 330px;">
              <div class="noticeList-container">
                <NoticeList :list="item.list" :empty-text="item.emptyText" />
              </div>
            </el-scrollbar>

          </el-tab-pane>
        </template>
      </el-tabs>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script lang="ts">

import { mapGetters } from 'vuex'
import NoticeList from './components/NoticeList.vue'
// import { loadMessages } from '@/api/user'

export default {
  components: {
    NoticeList
  },
  data() {
    return {
      notices: [],
      activeKey: '',
      noticesNum: 0
    }
  },
  computed: {
    ...mapGetters([
      'id',
      'newMessages',
      'notifications',
      'loadMask'
    ])
  },
  watch: {
    // 监听 vuex 中的 notification
    '$store.state.notifications.notifications': {
      handler(newVal) {
        if (newVal) {
        // 你可以根据 newVal 来处理通知
          this.fetchMessages()
          if (newVal.length > 0) {
            const lastNotification = newVal[newVal.length - 1] // 获取最新的通知
            if (lastNotification.command === 'addFriend') {
              this.$notify({
                title: '好友请求',
                message: `用户 ${lastNotification.senderId} 请求加你为好友。`,
                type: 'success',
                duration: 30000
              })
            } else {
            // 其他类型的处理，比如
              this.$notify({
                title: '提示',
                message: `收到命令：${lastNotification.command}`,
                type: 'info'
              })
            }
          }
        }
      },
      deep: true
    },
    '$store.state.messages.newMessages': {
      handler(newVal) {
        if (newVal) {
          // 你可以根据 newVal 来处理消息
          const lastMessage = newVal[newVal.length - 1] // 获取最新的消息
          if (lastMessage.senderId !== this.id) {
            this.fetchMessages()
            this.$notify({
              title: '新消息',
              message: `用户 ${lastMessage.senderId} 给你发了一条消息：${lastMessage.command}`,
              type: 'success'
            })
          }
        }
      }
    }
  },
  mounted() {
    this.syncNotifications()
    this.$store.dispatch('notifications/toggleLoadMask')
  },
  methods: {
    acceptRequest() {
      // 处理同意逻辑
      console.log('已同意好友请求')
    },
    rejectRequest() {
      // 处理拒绝逻辑
      console.log('已拒绝好友请求')
    },
    getLabel(item) {
      return item.name + (item.list.length > 0 ? `(${item.list.length})` : '')
    },

    async syncNotifications() {
      try {
        await this.$store.dispatch('notifications/fetchRemoteNotifications', this.id)
        this.fetchMessages()
      } catch (error) {
        console.error('同步消息失败:', error)
      }
    },

    fetchMessages() {
      try {
        const rawChatMessages = this.newMessages
        const rawCommandMessages = this.notifications

        // 将接口返回的数据转换为目标格式
        if (!rawChatMessages || !rawCommandMessages) {
          throw new Error('数据格式错误')
        }
        const ChatMessages = rawChatMessages.map(chat => ({
          avatar: `/api/user/getAvatar/${chat.senderId}.png`, // 构造 avatar
          title: `${chat.senderId} 回复了你`, // 构造 title
          description: chat.command, // 使用 command 字段
          datetime: chat.timestamp ? chat.timestamp : '未知时间', // 处理 timestamp
          type: chat.commandType // 转换 type
        }))

        const formattedChatMessages = {
          key: 'chat',
          name: '消息',
          list: ChatMessages
        }

        const CommandMessages = rawCommandMessages.map(command => ({
          avatar: '',
          title: command.commandType, // 构造 title
          description: command.command, // 使用 command 字段
          datetime: command.timestamp ? command.timestamp : '未知时间', // 处理 timestamp
          type: command.commandType // 转换 type
        }))

        const formattedCommandMessages = {
          key: 'command',
          name: '通知',
          list: CommandMessages
        }

        // 更新 notices 和其他相关数据
        const formattedMessages = [formattedChatMessages, formattedCommandMessages]
        this.notices = formattedMessages
        this.activeKey = formattedMessages.length ? formattedMessages[0].key : null
        this.noticesNum = 0
        formattedMessages.forEach((v) => {
          this.noticesNum += v.list.length
        })
      } catch (error) {
        console.error('加载消息失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.dropdown-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  .header-notice-icon {
    font-size: 18px;
  }
}

.dropdown-tabs {
  .noticeList-container {
    padding: 15px 24px 0;
    overflow-y: auto;  /* 确保出现滚动条 */
  }

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-wrap)::after {
    height: 1px;
  }

  :deep(.el-tabs__nav-wrap) {
    padding: 0 36px;
  }
}

::v-deep .el-scrollbar__wrap {
    overflow-x: hidden;
}
</style>

