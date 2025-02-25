<template>
  <div class="chat-container">
    <!-- 标题区域 -->
    <el-header height="68px" class="chat-header">
      <div class="chat-title">
        <span class="chat-title-text">当前会话 ID: {{ sessionId }}</span>
      </div>
    </el-header>

    <!-- 消息列表区域 -->
    <el-main ref="chatMain" class="chat-main" @scroll.passive="onScroll">
      <el-scrollbar class="chat-scrollbar">
        <div class="chat-message-list">
          <!-- 消息循环 -->
          <div
            v-for="(message) in filteredMessages"
            :key="message.id"
            :class="[
              'chat-message-item',
              message.senderId === userId ? 'is-self' : 'is-other'
            ]"
          >
            <!-- 如果是对方，就在左边显示头像 -->
            <div v-if="message.senderId !== userId" class="chat-avatar chat-avatar-left">
              <el-avatar
                :src="getAvatar(message.senderId)"
                size="medium"
                shape="square"
                style="border-radius: 8px;"
              />
            </div>

            <!-- 消息主体（姓名、时间、气泡等） -->
            <div class="chat-message-content">
              <div class="chat-message-info">
                <span class="chat-message-sender">{{ getSenderName(message.senderId) }}</span>
                <span class="chat-message-time">{{ formatTime(message.timestamp) }}</span>
              </div>
              <div class="chat-message-bubble">
                <p>{{ message.command }}</p>
              </div>
            </div>

            <!-- 如果是自己，就在右边显示头像 -->
            <div v-if="message.senderId === userId" class="chat-avatar chat-avatar-right">
              <el-avatar
                :src="getAvatar(message.senderId)"
                size="medium"
                shape="square"
                style="border-radius: 8px;"
              />
            </div>
          </div>
        </div>
      </el-scrollbar>
    </el-main>

    <!-- 输入区域 -->
    <el-footer height="60px" class="chat-footer">
      <el-input
        v-model="inputContent"
        placeholder="请输入消息..."
        clearable
        @keyup.enter.native="handleSend"
      />
      <el-button
        type="primary"
        icon="el-icon-chat-line-round"
        style="margin-left: 5px"
        @click="handleSend"
      >
        发送
      </el-button>
    </el-footer>
  </div>
</template>

<script>
import { sendCommand, sendGroupCommand } from '@/api/user'
import { mapGetters } from 'vuex'
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'Chat',
  props: {
    // 当前会话ID，例如：好友ID、群组ID或其他标识
    sessionId: {
      type: String,
      default: ''
    },
    sessionType: {
      type: String,
      default: ''
    },
    userId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      inputContent: '' // 输入框内容
    }
  },
  computed: {
    ...mapGetters([
      'messages',
      'id'
    ]),
    filteredMessages() {
      return this.messages.filter(message => message.senderId === this.sessionId || message.receiverId === this.sessionId)
    }
  },
  watch: {
    // 当会话ID变化时，重新加载聊天记录
    sessionId(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.loadMessages()
      }
    }
  },
  mounted() {
    if (this.sessionId) {
      this.loadMessages()
      this.syncMessages()
    }
  },
  methods: {
    // 加载聊天记录（真实情况：调用后端接口）
    async loadMessages() {
      try {
        await this.$store.dispatch('messages/loadMessages', this.id)
        this.$nextTick(() => this.scrollToBottom())
      } catch (error) {
        console.error('加载本地消息失败:', error)
      }
    },
    async syncMessages() {
      try {
        await this.$store.dispatch('messages/fetchRemoteMessages', this.id)
        this.$nextTick(() => this.scrollToBottom())
      } catch (error) {
        console.error('同步消息失败:', error)
      }
    },
    /*
    loadMessages() {
      // 这里简单模拟不同 sessionId 的数据
      // 可实际调用后端接口:

      if (this.sessionType === 'friend') {
        // axios.get(`/api/chat/friend?friendId=${this.sessionId}`)
      } else if (this.sessionType === 'group') {
        // axios.get(`/api/chat/group?groupId=${this.sessionId}`)
      }
      // this.messages = mockData

    },
    */
    // 发送消息
    handleSend() {
      if (!this.inputContent.trim()) return
      const newMessage = {
        id: uuidv4(), // 生成唯一 id
        senderId: this.userId,
        receiverId: this.sessionId,
        command: this.inputContent,
        commandType: 'chat',
        // 获取当前时间并手动调整时区偏移（北京时间是UTC+8）
        timestamp: new Date(new Date().getTime() + (8 * 60 * 60 * 1000)).toISOString(),
        processed: false,
        expiryTime: null
      }

      // 本地添加
      this.saveMessageToLocal(newMessage)
      this.inputContent = ''
      this.$nextTick(() => this.scrollToBottom())

      // 真实场景需要: axios.post('/api/chat/send', { sessionId: this.sessionId, content: this.inputContent });
      this.send(newMessage)
    },

    async send(command) {
      try {
        if (this.sessionType === 'friend') {
          await sendCommand(command)
        } else if (this.sessionType === 'group') {
          // 群聊发送给群组
          await sendGroupCommand(command)
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error)
      }
    },

    async saveMessageToLocal(newMessage) {
      try {
        await this.$store.dispatch('messages/saveMessage', { message: newMessage, userId: this.id })
        await this.loadMessages() // 重新加载本地消息
      } catch (error) {
        console.error('保存本地消息失败:', error)
      }
    },

    // 滚动到底部
    scrollToBottom() {
      const wrap = this.$refs.chatMain.$el.querySelector('.el-scrollbar__wrap')
      if (wrap) {
        wrap.scrollTop = wrap.scrollHeight
      }
    },
    // 获取发送者名称(可以做更多逻辑区分)
    getSenderName(senderId) {
      return senderId === this.userId ? '我' : `用户${senderId.slice(-3)}`
    },
    // 获取用户头像地址
    getAvatar(senderId) {
      // 实际可根据用户ID查库或通过后端API返回
      // 示例：区分自己(user_001)和对方(user_002)
      if (senderId === 'user_001') {
        return 'https://i.pravatar.cc/150?img=3' // 自己的头像
      } else {
        return 'https://i.pravatar.cc/150?img=1' // 对方的头像
      }
    },
    // 格式化时间(示例)
    formatTime(time) {
      return time
    },

    // 监听滚动(如需上拉加载更多)
    onScroll() {
      // ...
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
  overflow: hidden;
}

/* 头部 */
.chat-header {
  display: flex;
  align-items: center;
  background: #409eff;
  color: #fff;
}

.chat-title {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.chat-title-text {
  font-size: 16px;
}

/* 主体 */
.chat-main {
  flex: 1;
}

.chat-scrollbar {
  width: 100%;
  height: 100%;
}

.chat-message-list {
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.chat-message-item {
  display: flex;
  align-items: flex-end; /* 头像与气泡对齐到底部 */
  margin-bottom: 15px;
}

/* 自己(右侧)的消息 */
.is-self {
  justify-content: flex-end;
}

/* 他人(左侧)的消息 */
.is-other {
  justify-content: flex-start;
}

/* 头像区域，区分左/右 */
.chat-avatar {
  align-self: flex-end;
}
.chat-avatar-left {
  margin-right: 8px;
}
.chat-avatar-right {
  margin-left: 8px;
}

/* 消息内容容器 */
.chat-message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* 如果是自己，就在右侧气泡对齐 */
.is-self .chat-message-content {
  align-items: flex-end;
}

/* 消息信息 */
.chat-message-info {
  margin-bottom: 3px;
  font-size: 12px;
  color: #909399;
}

/* 消息气泡 */
.chat-message-bubble {
  border-radius: 8px;
  padding: 0px 12px; /* 内边距调整 */
  word-wrap: break-word;
  line-height: 0.5;
  background-color: #ebeef5;
  color: #333;
  text-align: left;
}

/* 自己的气泡颜色 */
.is-self .chat-message-bubble {
  background-color: #409eff;
  color: #fff;
  text-align: right;
}

/* 底部输入区 */
.chat-footer {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  background: #fff;
  border-top: 1px solid #ebeef5;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

::v-deep .el-scrollbar__wrap {
    overflow-x: hidden;
}
</style>
