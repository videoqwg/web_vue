<template>
  <div>
    <el-button @click="handleSend">测试按钮</el-button>
  </div>
</template>

<script>
import { addFriend, sendCommand } from '@/api/user'
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'Dashboard',
  data() {
    return {
    }
  },
  methods: {
    handleTestButtonClick() {
      this.$message('按钮已点击！')
      addFriend({ friendId: '123' }).then(res => {
        this.$message.success('添加好友成功！')
      }).catch(() => {
        this.$message.error('添加好友失败！')
      })
    },
    handleSend() {
      const newMessage = {
        id: uuidv4(), // 生成唯一 id
        senderId: '11111111112',
        receiverId: '11111111111',
        command: 'addFriend',
        commandType: 'notification',
        // 获取当前时间并手动调整时区偏移（北京时间是UTC+8）
        timestamp: new Date(new Date().getTime() + (8 * 60 * 60 * 1000)).toISOString(),
        processed: false,
        expiryTime: new Date(new Date().getTime() + (8 * 60 * 60 * 1000) + (30 * 1000)).toISOString()
      }
      sendCommand(newMessage).then(res => {
        this.$message.success('发送消息成功！')
      }).catch(() => {
        this.$message.error('发送消息失败！')
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
