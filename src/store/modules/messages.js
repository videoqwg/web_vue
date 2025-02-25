
import { createUserDatabase } from '@/utils/database'
import { syncMessages } from '@/api/user'

const state = {
  messages: [], // 消息列表
  newMessages: [], // 新消息列表
  lastSyncTime: null // 上次同步的时间戳
}

const getters = {
  messages: (state) => state.messages,
  newMessages: (state) => state.newMessages,
  lastSyncTime: (state) => state.lastSyncTime
}

const mutations = {
  SET_MESSAGES(state, messages) {
    state.messages = messages
  },
  ADD_MESSAGE(state, message) {
    state.messages.push(message)
  },
  SET_NEW_MESSAGES(state, newMessages) {
    state.newMessages = newMessages
  },
  ADD_NEW_MESSAGES(state, newMessages) {
    state.newMessages.push(newMessages)
  },
  SET_LAST_SYNC_TIME(state, timestamp) {
    state.lastSyncTime = timestamp
  }
}

const actions = {
  // 从 Dexie.js 加载本地消息到 Vuex
  async loadMessages({ commit, rootState }, userId) {
    if (!userId) {
      userId = rootState.user.id
    }
    if (!userId) {
      console.error('loadMessages: userId 未设置')
      return
    }
    try {
      const db = createUserDatabase(userId)
      const messages = await db.messages.orderBy('timestamp').toArray()
      commit('SET_MESSAGES', messages)
    } catch (error) {
      console.error('加载本地消息失败:', error)
    }
  },

  // 保存消息到 Dexie.js 和 Vuex
  async saveMessage({ commit, rootState }, { message, userId }) {
    if (!userId) {
      userId = rootState.user.id
    }
    if (!userId) {
      console.error('saveMessage: userId 未设置')
      return
    }
    try {
      const db = createUserDatabase(userId)
      if (message.commandType === 'chat') {
        await db.messages.put(message) // 保存到 Dexie.js
        commit('ADD_MESSAGE', message) // 更新 Vuex
        if (message.senderId !== userId) {
          commit('ADD_NEW_MESSAGES', message)
        }
      }
    } catch (error) {
      console.error('保存消息失败:', error)
    }
  },

  // 从后端拉取最新消息
  async fetchRemoteMessages({ commit, dispatch, rootState }, userId) {
    if (!userId) {
      userId = rootState.user.id
    }
    if (!userId) {
      console.error('fetchRemoteMessages: userId 未设置')
      return
    }

    const db = createUserDatabase(userId)
    db.messages.orderBy('timestamp') // 按时间戳排序
      .last() // 获取最新一条记录
      .then(message => {
        let timestamp
        if (message) {
          timestamp = message.timestamp
        } else {
          timestamp = null
        }
        try {
          syncMessages({ 'timestamp': timestamp })
            .then((response) => {
              const messages = response.data
              if (messages.length !== 0) {
                for (const msg of messages) {
                  db.messages.put(msg)
                  if (msg.senderId !== rootState.user.id) {
                    commit('ADD_NEW_MESSAGES', msg)
                  }
                }
              }
            })
          dispatch('loadMessages', userId)
        } catch (error) {
          console.error('从后端获取数据失败:', error)
        }
      })
      .catch(err => {
        console.error('获取最新消息失败:', err)
      })
  }

}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
