
import { createUserDatabase } from '@/utils/database'
import { syncNotifications } from '@/api/user'

const state = {
  notifications: [], // 通知列表
  lastSyncTime: null, // 上次同步的时间戳,
  loadMask: false // 防止因页面大小变化导致notification子组件出现抖动现象
}

const getters = {
  notifications: (state) => state.notifications,
  lastSyncTime: (state) => state.lastSyncTime,
  loadMask: (state) => state.loadMask
}

const mutations = {
  SET_NOTIFICATIONS(state, notifications) {
    state.notifications = notifications
  },
  ADD_NOTIFICATION(state, notification) {
    state.notifications.push(notification)
  },
  REMOVE_NOTIFICATION(state, messageId) {
    state.notifications = state.notifications.filter(msg => msg.id !== messageId)
  },
  SET_LAST_SYNC_TIME(state, timestamp) {
    state.lastSyncTime = timestamp
  },
  SET_LOAD_MASK(state, loadMask) {
    state.loadMask = loadMask
  }
}

const actions = {
  async loadNotifications({ commit, rootState, dispatch }, userId) {
    if (!userId) {
      userId = rootState.user.id
    }
    if (!userId) {
      console.error('loadNotifications: userId 未设置')
      return
    }
    try {
      const db = createUserDatabase(userId)
      const notifications = await db.notifications.orderBy('timestamp').toArray()
      commit('SET_NOTIFICATIONS', notifications)
      state.notifications.forEach((notification) => { dispatch('setTimer', { notification, userId }) })
    } catch (error) {
      console.error('加载本地消息失败:', error)
    }
  },

  // 保存消息到 Dexie.js 和 Vuex
  async saveNotification({ commit, rootState, dispatch }, { notification, userId }) {
    if (!userId) {
      userId = rootState.user.id
    }
    if (!userId) {
      console.error('saveNotification: userId 未设置')
      return
    }
    try {
      const db = createUserDatabase(userId)
      if (notification.commandType === 'notification') {
        await db.notifications.put(notification)
        commit('ADD_NOTIFICATION', notification)
        dispatch('setTimer', { notification, userId })
      }
    } catch (error) {
      console.error('保存通知失败:', error)
    }
  },

  async fetchRemoteNotifications({ commit, dispatch, rootState }, userId) {
    if (!userId) {
      userId = rootState.user.id
    }
    if (!userId) {
      console.error('fetchRemoteNotifications: userId 未设置')
      return
    }
    const db = createUserDatabase(userId)

    db.notifications.orderBy('timestamp') // 按时间戳排序
      .last() // 获取最新一条记录
      .then(message => {
        let timestamp
        if (message) {
          timestamp = message.timestamp
        } else {
          timestamp = null
        }
        try {
          syncNotifications({ 'timestamp': timestamp })
            .then((response) => {
              const notifications = response.data
              if (notifications.length !== 0) {
                for (const notice of notifications) {
                  db.messages.put(notice)
                  if (notice.senderId !== rootState.user.id) {
                    commit('ADD_NOTIFICATION', notice)
                  }
                }
              }
            })
          dispatch('loadNotifications', userId)
        } catch (error) {
          console.error('从后端获取通知失败:', error)
        }
      })
      .catch(err => {
        console.error('获取最新通知失败:', err)
      })
  },

  setTimer({ dispatch }, { notification, userId }) {
    console.log('test4', notification)
    const now = new Date()
    const expiry = new Date(notification.expiryTime)
    const remainingMs = expiry - now - 8 * 3600 * 1000

    if (remainingMs > 0) {
      setTimeout(() => {
        dispatch('deleteNotification', { notificationId: notification.id, userId })
      }, remainingMs)
    } else {
      dispatch('deleteNotification', { notificationId: notification.id, userId })
    }
  },

  deleteNotification({ commit }, { notificationId, userId }) {
    console.log('test455', notificationId)
    commit('REMOVE_NOTIFICATION', notificationId)

    const db = createUserDatabase(userId)
    db.notifications.get(notificationId)
      .then(record => {
        if (record) {
          return db.notifications.delete(notificationId)
        }
      })
      .catch(error => {
        console.error('操作中发生错误：', error, notificationId)
      })
  },

  toggleLoadMask({ commit, state }) {
    commit('SET_LOAD_MASK', !state.loadMask) // 切换 loadMask 状态
  }

}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
