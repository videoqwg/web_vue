<template>
  <div>
    <div class="components-container">
      <pan-thumb :image="image" />
      <el-button type="primary" icon="el-icon-upload" style="position: relative; margin-left: 40px;" @click="imagecropperShow = true">
        更换头像
      </el-button>
      <image-cropper
        v-show="imagecropperShow"
        :key="imagecropperKey"
        :width="300"
        :height="300"
        url="user/uploadAvatar"
        :field="user.name"
        lang-type="en"
        @close="close"
        @crop-upload-success="cropSuccess"
      />
    </div>
    <el-form ref="form" :model="user" :rules="rules">
      <el-form-item label="手机号码" prop="phone">
        <el-input v-model.trim="user.phone" :disabled="isReadonly" placeholder="请输入手机号码" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model.trim="user.email" :disabled="isReadonly" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="介绍" prop="introduction">
        <el-input
          v-model.trim="user.introduction"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4}"
          placeholder="请输入内容"
          :disabled="isReadonly"
        />
      </el-form-item>
      <el-form-item>
        <template v-if="isReadonly">
          <el-button type="primary" @click="enableEditing">Update</el-button>
        </template>
        <template v-else>
          <el-button type="success" @click="confirmUpdate">Confirm</el-button>
          <el-button type="danger" @click="cancelEditing">Cancel</el-button>
        </template>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import ImageCropper from '@/components/ImageCropper'
import PanThumb from '@/components/PanThumb'

export default {
  components: { ImageCropper, PanThumb },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    const validateNotEmpty = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请完善信息'))
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      const phoneRegex = /^\d{11}$/ // 匹配11位数字
      if (!phoneRegex.test(value)) {
        callback(new Error('请输入正确的手机号码'))
      } else {
        callback()
      }
    }

    const validateEmail = (rule, value, callback) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // 简单的邮箱格式验证
      if (!emailRegex.test(value)) {
        callback(new Error('输入正确的邮箱'))
      } else {
        callback()
      }
    }

    return {
      isReadonly: true, // 默认信息为只读
      imagecropperShow: false,
      imagecropperKey: 0,
      image: this.user.avatar,
      rules: {
        phone: [
          { required: true, validator: validateNotEmpty, trigger: 'blur' },
          { validator: validatePhone, trigger: 'blur' }
        ],
        email: [
          { required: true, validator: validateNotEmpty, trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    cropSuccess(resData) {
      this.imagecropperShow = false
      this.imagecropperKey += 1
      const newAvatarUrl = `${resData.avatar}?timestamp=${Date.now()}` // 添加时间戳，防止缓存
      this.image = newAvatarUrl
      this.$store.commit('user/SET_AVATAR', newAvatarUrl)
    },
    close() {
      this.imagecropperShow = false
    },
    enableEditing() {
      this.isReadonly = false
    },
    confirmUpdate() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$store.dispatch('user/updateUserData', this.user)
            .then(() => {
            // 更新成功
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
        } else {
          // 表单校验失败消息
          this.$message({
            message: '请完善所有必填信息',
            type: 'error'
          })
        }
      })
    },
    cancelEditing() {
      this.isReadonly = true
    }
  }
}
</script>
