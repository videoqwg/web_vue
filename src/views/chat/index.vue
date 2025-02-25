<template>
  <div class="chat-room-container">
    <div class="chat-left-panel">
      <!-- 顶部区域：搜索框 + 添加用户按钮 -->
      <div class="left-top-panel">
        <el-row :gutter="24">
          <el-col :span="12">
            <!-- 搜索框 -->
            <el-input
              v-model="searchKeyword"
              class="search-input"
              placeholder="搜索"
              clearable
              prefix-icon="el-icon-search"
            />
          </el-col>
          <el-col :span="12">
            <!-- 添加用户按钮 -->
            <el-dropdown
              split-button
              type="primary"
              @click="handleButtonClick"
            >
              {{ buttonLabel }}
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="(item, index) in dropdownOptions"
                  :key="index"
                  @click.native="handleSelect(item)"
                >
                  {{ item.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-col>
        </el-row>
      </div>

      <el-menu
        default-active="0"
        class="aside-menu"
      >
        <!-- 好友分组 -->
        <el-submenu index="friends">
          <template slot="title">
            <i class="el-icon-user-solid" />
            <span>好友</span>
          </template>
          <el-menu-item
            v-for="(friend) in filteredFriends"
            :key="friend.userid"
            :index="friend.userid"
            @click="handleSelectSession(friend.userid, 'friend')"
            @mouseover.native="hoverId = friend.userid"
            @mouseleave.native="hoverId = null"
          >
            <div
              class="menu-item-content"
            >
              <!-- 左侧：显示头像 + 好友名称 -->
              <div class="menu-left">
                <el-avatar
                  :src="friend.avatar"
                  size="medium"
                  shape="square"
                  style="margin-right: 8px; border-radius: 8px;"
                />
                <span>{{ friend.username }}</span>
              </div>

              <!-- 右侧：只显示删除图标，且鼠标悬停此好友项时才展示；并阻止点击冒泡 -->
              <div class="menu-icon-right" @click.stop>
                <i
                  v-if="hoverId === friend.userid"
                  class="el-icon-delete"
                  title="删除好友"
                  @click="onDeleteFriend(friend)"
                />
              </div>
            </div>
          </el-menu-item>
        </el-submenu>

        <!-- 群组分组 -->
        <el-submenu index="groups">
          <template slot="title">
            <i class="el-icon-s-grid" />
            <span>群组</span>
          </template>
          <el-menu-item
            v-for="group in filteredGroups"
            :key="group.groupId"
            :index="group.groupId"
            @click="handleSelectSession(group.groupId, 'group')"
            @mouseover.native="hoverId = group.groupId"
            @mouseleave.native="hoverId = null"
          >
            <div
              class="menu-item-content"
            >
              <!-- 左侧图标和名称/输入框 -->
              <div class="menu-left">
                <i class="el-icon-menu" />
                <!-- 如果处于编辑状态，就显示输入框，否则显示原名称 -->
                <template v-if="editingId === group.groupId">
                  <el-input
                    v-model="tempName"
                    size="mini"
                    class="group-edit-input"
                    @click.stop
                  />
                </template>
                <template v-else>
                  <span>{{ group.groupName }}</span>
                </template>
              </div>

              <!-- 右侧图标，根据状态显示不同的图标 -->
              <div class="menu-icon-right" @click.stop>
                <!-- 如果正在编辑 -->
                <template v-if="editingId === group.groupId">
                  <i
                    class="el-icon-check"
                    title="保存"
                    @click.stop="onConfirmEdit(group)"
                  />
                  <i
                    class="el-icon-close"
                    title="取消"
                    @click.stop="onCancelEdit"
                  />
                </template>
                <!-- 如果没有处于编辑状态，并且鼠标悬停/或想改成点击可自行调整逻辑 -->
                <template v-else-if="hoverId === group.groupId">
                  <i
                    class="el-icon-edit"
                    title="编辑"
                    @click.stop="onEdit(group)"
                  />
                  <i
                    class="el-icon-delete"
                    title="删除"
                    @click.stop="onDelete(group)"
                  />
                </template>
              </div>
            </div>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </div>

    <!-- 中间区域：聊天窗口 -->
    <div class="chat-center">
      <div class="content">
        <Chat
          v-if="currentSessionId"
          :session-id="currentSessionId"
          :session-type="currentSessionType"
          :user-id="id"
        />
      </div>
    </div>

    <!-- 右侧区域 -->
    <div class="chat-right" @click="hideContextMenu">
      <!-- 当前会话为好友时展示个人卡片 -->
      <user-card
        v-if="currentSessionType === 'friend'"
        :userid="currentSessionId"
      />

      <!-- 当前会话为群聊时展示群成员列表 -->
      <div v-else-if="currentSessionType === 'group'">

        <div ref="customArea" class="members-wrapper">
          <el-menu
            default-active="0"
            class="aside-menu"
            unique-opened
            :default-openeds="['friends']"
          >
            <!-- 1. 成员列表菜单 -->
            <el-submenu index="friends">
              <template #title>
                <i class="el-icon-user-solid" />
                <span>成员</span>
              </template>
              <el-menu-item
                v-for="(member) in groupMembers"
                :key="member.id"
                :index="String(member.id)"
                @click="handleSelectSession(member.id, 'friend')"
                @contextmenu.prevent.native="handleContextMenu($event, member)"
              >
                <div class="menu-item-content">
                  <el-avatar
                    :src="member.avatar"
                    size="medium"
                    shape="square"
                    style="margin-right: 8px; border-radius: 8px;"
                  />
                  <span>{{ member.name }}</span>
                </div>
              </el-menu-item>
            </el-submenu>

            <!-- 自定义右键菜单 :style="{ top: menuY + 'px', left: menuX + 'px' }"-->
            <div
              v-if="menuVisible"
              class="context-menu"
              :style="{ top: menuY + 'px', left: menuX + 'px' }"
            >
              <ul>
                <li @click="handleClick('Action 1')">设置管理员</li>
                <li @click="handleClick('Action 2')">禁言</li>
                <li @click="handleClick('Action 3')">踢出群聊</li>
              </ul>
            </div>
          </el-menu>
        </div>
      </div>
      <!-- 否则可以做一些占位提示 -->
      <div v-else class="right-placeholder">
        <i>暂无信息</i>
      </div>
    </div>
  </div>
</template>

<script>
import UserCard from './usercard.vue'
import Chat from './chat.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'ChatRoom',
  components: {
    UserCard,
    Chat
  },
  data() {
    return {
      searchKeyword: '',
      buttonLabel: '选择', // 默认按钮文字
      selectedOption: null, // 当前选中的选项
      dropdownOptions: [
        { label: '添加好友', action: this.handleAddFriend },
        { label: '创建群组', action: this.handleCreateGroup },
        { label: '加入群组', action: this.handleJoinGroup }
      ],
      groupMembers: [
        { id: 'user_002', name: '张三', avatar: 'https://i.pravatar.cc/24?img=1' },
        { id: 'user_003', name: '李四', avatar: 'https://i.pravatar.cc/24?img=2' }
      ], // 当前群聊成员列表
      currentSessionId: '',
      currentSessionType: '',
      hoverId: null, // 用于记录当前鼠标悬浮在哪个群组上
      editingId: null, // 用于标识正在编辑的群组ID
      tempName: '', // 编辑时的临时输入
      menuVisible: false, // 控制菜单显示
      menuX: 0, // 右键菜单 X 坐标
      menuY: 0, // 右键菜单 Y 坐标
      selectedMember: null // 当前右键点击到的成员信息
    }
  },
  computed: {
    ...mapGetters([
      'id',
      'friends',
      'groups'
    ]),
    // 根据搜索关键词过滤好友
    filteredFriends() {
      return this.friends.filter((friend) =>
        friend.username.includes(this.searchKeyword)
      )
    },
    // 根据搜索关键词过滤群组
    filteredGroups() {
      return this.groups.filter((group) =>
        group.groupName.includes(this.searchKeyword)
      )
    }
  },

  created() {
    // 在这里可以调用接口初始化好友列表和群组列表
    this.fetchFriendList()
    this.fetchGroupList()
  },

  methods: {
    handleSelect(item) {
      // 更新按钮的文字
      this.buttonLabel = item.label
      this.selectedOption = item // 保存当前选项
    },
    handleButtonClick() {
      // 点击按钮时触发选项对应的事件
      if (this.selectedOption && this.selectedOption.action) {
        this.selectedOption.action()
      } else {
        alert('请先选择一个选项！')
      }
    },

    handleSelectSession(sessionId, sessionType) {
      // 根据子组件的选择进行显示切换
      this.currentSessionId = sessionId
      this.currentSessionType = sessionType
      if (this.currentSessionType === 'group') {
        this.loadGroupMembers(this.currentSessionId)
      }
    },

    // 点击编辑图标
    onEdit(group) {
      this.editingId = group.groupId
      this.tempName = group.groupName // 将原群组名赋给临时变量
    },

    // 确认保存编辑
    onConfirmEdit(group) {
      // 此处可调用接口，成功后再赋值
      group.groupName = this.tempName
      this.editingId = null
      // 也可以在此发请求，比如：this.$axios.post('/api/updateName', { id: group.groupId, name: this.tempName })
    },

    // 取消编辑
    onCancelEdit() {
      this.editingId = null
      this.tempName = ''
    },

    // 删除
    onDelete(group) {
      // 此处可弹确认框，再删除
      // 例：this.$confirm('确定删除吗？').then(() => { ... })
      console.log('delete group', group)
    },

    handleContextMenu(event, member) {
      event.preventDefault() // 阻止浏览器默认右键菜单

      const areaRect = this.$refs.customArea.getBoundingClientRect()
      const offsetX = event.clientX - areaRect.left
      const offsetY = event.clientY - areaRect.top

      this.menuX = offsetX
      this.menuY = offsetY
      this.menuVisible = true
    },
    handleClick(action) {
      console.log(`Selected action: ${action}`)
      this.hideContextMenu()
    },
    // 点击空白处隐藏菜单
    hideContextMenu() {
      this.menuVisible = false
    },
    // 下拉菜单操作
    setAdmin(member) {
      console.log('设置管理员:', member)
      // 这里写你实际的业务逻辑...
    },
    muteMember(member) {
      console.log('禁言:', member)
      // 这里写你实际的业务逻辑...
    },
    deleteMember(member) {
      console.log('删除:', member)
      // 这里写你实际的业务逻辑...
    },

    // TODO: 获取好友列表
    fetchFriendList() {
      if (this.friends.length === 0) {
        this.$store.dispatch('user/getFriends')
          .then(() => { // 这里不需要做额外处理，因为数据已经存储在 Vuex 中，只需要在列表为空时申请一次数据即可
          })
          .catch(error => {
            this.$message({
              message: error.message || '服务器错误，请稍后再试',
              type: 'error'
            })
          })
      }
    },
    // TODO: 获取群组列表
    fetchGroupList() {
      if (this.groups.length === 0) {
        this.$store.dispatch('user/getGroups')
          .then(() => { // 这里不需要做额外处理，因为数据已经存储在 Vuex 中，只需要在列表为空时申请一次数据即可
          })
          .catch(error => {
            this.$message({
              message: error.message || '服务器错误，请稍后再试',
              type: 'error'
            })
          })
      }
    },
    // TODO: 加载历史消息
    // TODO: 加载群组成员
    loadGroupMembers(groupId) {
      const group = this.groups.find(group => group.groupId === groupId)
      console.log('加载群组成员:', group)
      this.groupMembers = group.members.map(member => {
        const { userId } = member
        return {
          id: userId,
          name: userId,
          avatar: `/api/user/getAvatar/${userId}.png` // 动态生成头像链接
        }
      })
    },
    // 搜索功能
    handleSearch() {
      // TODO: 调用接口搜索好友/群组，也可以在本地 friendList / groupList 中进行筛选
      console.log('搜索关键词：', this.searchKeyword)
    },
    // 添加好友
    handleAddFriend() {
      if (!this.searchKeyword) {
        this.$message.error('请输入好友名称')
        return
      }
      if (this.searchKeyword === this.$store.state.user.name) {
        this.$message.error('不能添加自己为好友')
        return
      }
      this.$store.dispatch('user/addFriends', { 'friend': this.searchKeyword })
        .then(() => {
          this.$message({
            message: '添加好友请求已发送',
            type: 'success'
          })
        })
        .catch(error => {
          console.error('添加好友失败', error) // 这里不直接提示错误信息是因为在util的request.js中已经做了统一处理，不然会出现两次错误提示
        })
    }
  }
}
</script>

  <style scoped>

  .submenu-title {
  display: flex;
  align-items: center;
  font-size: 16px;
}
  .chat-room-container {
    width: 1300px;
    height: 600px;
    margin: 20px auto;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    overflow: hidden;
  }

  .chat-left-panel {
  width: 340px;
  height: 100%;
  background-color: #fff;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
}

/* 顶部区域：搜索框 + 按钮 */
.left-top-panel {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  margin-right: 8px;
}

/* 菜单本身占据剩余空间 */
.aside-menu {
  flex: 1;
  border: none; /* 去掉默认边框 */
  background-color: #fff; /* 与面板背景保持一致 */
}

/* 自定义菜单项的内容布局 */
.menu-item-content {
  display: flex;
  align-items: center;
}

/* 右侧图标区域：绝对定位到右边 */
.menu-icon-right {
  position: absolute;
  right: 0px;
  display: flex;
  align-items: center;
  margin-right: 8px;
}

  /* 中间区域：聊天 */
  .chat-center {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #ebeef5;
  }

  /* 右侧区域 */
  .chat-right {
    width: 300px;
    padding: 10px;
    background: #ffffff;
    overflow-y: auto;
  }
  .right-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #aaa;
    font-style: italic;
  }

  /* 自定义菜单样式 */
.context-menu {
  position: absolute;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  z-index: 1000;
  animation: fade-in 0.2s ease-out;
}

.context-menu ul {
  list-style: none;
  text-align: center; /* 列表项居中对齐 */
  font-size: 14px; /* 调整字体大小 */
  margin: 0;
  padding: 0;
}

.context-menu li {
  padding: 8px 16px;
  cursor: pointer;
  white-space: nowrap;
}

.context-menu li:hover {
  background: #0078d4;
  color: #fff;
}

/* 动画效果 */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

  </style>
