<template>
  <el-form>
    <el-form-item label="用户名">
      <el-input v-model.trim="user.name" :disabled="isReadonly" />
    </el-form-item>
    <el-form-item label="密码">
      <el-input
        v-model="password"
        placeholder="请输入密码"
        show-password
        :disabled="isReadonly"
        @focus="showRepeatPassword"
      />
    </el-form-item>
    <el-form-item v-if="showRepeat">
      <el-input
        v-model="repeatPassword"
        placeholder="请重复输入密码"
        show-password
        @blur="resetPasswordIfEmpty"
      />
    </el-form-item>
    <el-form-item label="身份">
      <el-input v-model.trim="user.role" :disabled="true" />
    </el-form-item>
    <el-form-item>
      <template v-if="isReadonly">
        <el-button type="primary" @click="enableEditing">
          Update
        </el-button>
      </template>
      <template v-else>
        <el-button type="success" @click="confirmUpdate">
          Confirm
        </el-button>
        <el-button type="danger" @click="cancelEditing">
          Cancel
        </el-button>
      </template>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          role: ''
        }
      }
    }
  },
  data() {
    return {
      isReadonly: true, // 默认信息为只读
      password: '********', // 初始密码占位符
      repeatPassword: '', // 重复密码框
      showRepeat: false // 控制重复密码框显示
    }
  },
  methods: {
    enableEditing() {
      this.isReadonly = false
    },
    confirmUpdate() {
      // 这里不用element自带的校验是因为不好传送表单给后端
      if (!this.password) {
        this.$message.error('密码不能为空')
        return
      }
      if (this.password.length < 6) {
        this.$message.error('密码长度不能小于6位')
        return
      }
      if (this.password !== this.repeatPassword && this.showRepeat) {
        this.$message.error('密码不一致，请重新输入')
        return
      }
      let accountForm = {}
      if (this.showRepeat) {
        accountForm = { 'username': this.user.name, 'password': this.password }
      } else {
        accountForm = { 'username': this.user.name }
      }
      this.$store.dispatch('user/updateAccountData', accountForm)
        .then(() => {
          // 更新成功
          this.isReadonly = true
          this.showRepeat = false
          this.$message({
            message: '用户信息已成功更新',
            type: 'success'
          })
          this.isReadonly = true // 切换为只读状态
        })
        .catch(error => {
          // 更新失败
          this.$message({
            message: error.message || '更新失败，请稍后再试',
            type: 'error'
          })
        })
    },
    cancelEditing() {
      this.isReadonly = true
      this.password = '********'
      this.repeatPassword = ''
      this.showRepeat = false
    },
    showRepeatPassword() {
      if (!this.isReadonly && !this.repeatPassword) {
        this.password = ''
        this.repeatPassword = ''
        this.showRepeat = true
      }
    },
    resetPasswordIfEmpty() {
      if (!this.password && !this.repeatPassword) {
        this.password = '********'
        this.repeatPassword = ''
        this.showRepeat = false
      }
    }
  }
}
</script>

