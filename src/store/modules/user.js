import { login, register, logout, getInfo, updateUserData, updateAccountData, getFriends, getGroups, addFriend } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import WebSocketSingleton from '@/utils/websocketInstance'
// import { setEncryptedCookie, getDecryptedCookie, removeCookie } from '@/utils/EncryptedCookie'

const getDefaultState = () => {
  return {
    token: getToken(),
    id: '',
    name: '',
    avatar: '',
    introduction: '',
    phone: '',
    email: '',
    roles: [],
    friends: [],
    groups: []
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_ID: (state, id) => {
    state.id = id
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_PHONE: (state, phone) => {
    state.phone = phone
  },
  SET_EMAIL: (state, email) => {
    state.email = email
  },
  SET_FRIENDS: (state, friends) => {
    state.friends = friends
  },
  SET_GROUPS: (state, groups) => {
    state.groups = groups
  }
}

const actions = {

  // 示例：添加消息到 messages 模块
  addMessageToMessagesModule({ dispatch }, message) {
  // 调用 messages 模块的 ADD_MESSAGE 方法
    dispatch('messages/saveMessage', message, { root: true })
  },

  // 示例：加载 messages 模块的消息
  loadMessagesFromMessagesModule({ dispatch }) {
  // 调用 messages 模块的 loadMessages 方法
    dispatch('messages/loadMessages', null, { root: true })
  },

  // 示例：同步消息
  syncMessagesWithBackend({ dispatch }) {
  // 调用 messages 模块的 syncWithBackend 方法
    dispatch('messages/syncWithBackend', null, { root: true })
  },

  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  register({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      register({ username: username.trim(), password })
        .then(response => {
          const { code, message } = response
          if (code === 400) {
            reject(new Error(message || '用户名已存在'))
          } else if (code === 200) {
            resolve()
          } else {
            reject(new Error(message || '发生未知错误'))
          }
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // get user info

  getInfo({ commit, dispatch }) {
    return new Promise((resolve, reject) => {
      getInfo()
        .then((response) => {
          const { data } = response
          if (!data) {
            return reject('Verification failed, please Login again.')
          }

          if (!data.roles || data.roles.length <= 0) {
            reject('getInfo: roles must be a non-null array!')
          }

          commitUserInfoToState(commit, data)

          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
  /*
  getInfo({ commit, dispatch }) {
    return new Promise((resolve, reject) => {
      const localUserInfo = getDecryptedCookie('userInfo')

      if (localUserInfo) {
        console.log('从本地存储中读取用户信息')
        commitUserInfoToState(commit, localUserInfo)

        const wsInstance = WebSocketSingleton.getInstance(localUserInfo.userid)
        wsInstance.addEventListener('message', (event) => {
          const rawcommand = JSON.parse(event.data)
          const { id, ...command } = rawcommand
          void id
          if (rawcommand.senderId !== localUserInfo.userid) {
          // 使用 context.dispatch 调用 messages 模块的 action
            dispatch('messages/saveMessage', { message: command, userId: localUserInfo.userid }, { root: true })
          }
        })

        resolve(localUserInfo)
      } else {
        console.log('本地存储中没有用户信息，向后端请求')
        getInfo()
          .then((response) => {
            const { data } = response
            if (!data) {
              return reject('Verification failed, please Login again.')
            }

            if (!data.roles || data.roles.length <= 0) {
              reject('getInfo: roles must be a non-null array!')
            }

            commitUserInfoToState(commit, data)
            setEncryptedCookie('userInfo', data)

            const wsInstance = WebSocketSingleton.getInstance(data.userid)
            wsInstance.addEventListener('message', (event) => {
              const rawcommand = JSON.parse(event.data)
              const { id, ...command } = rawcommand
              void id
              if (rawcommand.senderId !== data.userid) {
              // 使用 context.dispatch 调用 messages 模块的 action
                dispatch('messages/saveMessage', { message: command, userId: data.userid }, { root: true })
              }
            })

            resolve(data)
          })
          .catch((error) => {
            reject(error)
          })
      }
    })
  },
  */

  updateUserData({ commit }, userForm) {
    return new Promise((resolve, reject) => {
      updateUserData(userForm).then(response => {
        commit('SET_INTRODUCTION', userForm.introduction)
        commit('SET_PHONE', userForm.phone)
        commit('SET_EMAIL', userForm.email)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  updateAccountData({ commit }, accountForm) {
    return new Promise((resolve, reject) => {
      updateAccountData(accountForm).then(response => {
        commit('SET_NAME', accountForm.username)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  getFriends({ commit }) {
    return new Promise((resolve, reject) => {
      getFriends().then(response => {
        const { data } = response
        commit('SET_FRIENDS', data)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  addFriends({ commit }, friend) {
    return new Promise((resolve, reject) => {
      addFriend(friend).then(response => {
        const { data } = response
        const currentFriends = state.friends || []
        const updatedFriends = [...currentFriends, data.friend]
        commit('SET_FRIENDS', updatedFriends)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  getGroups({ commit }) {
    return new Promise((resolve, reject) => {
      getGroups().then(response => {
        const { data } = response
        commit('SET_GROUPS', data)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        // removeCookie('userInfo') // 删除本地存储的用户信息
        resetRouter()
        commit('RESET_STATE')
        WebSocketSingleton.resetInstance
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      // removeCookie('userInfo') // 删除本地存储的用户信息
      commit('RESET_STATE')
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'
    commit('SET_TOKEN', token)
    setToken(token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  }

}

function commitUserInfoToState(commit, data) {
  const { userid, roles, username, avatar, introduction, phone, email } = data

  commit('SET_ID', userid)
  commit('SET_ROLES', roles)
  commit('SET_NAME', username)
  commit('SET_AVATAR', avatar)
  commit('SET_INTRODUCTION', introduction)
  commit('SET_PHONE', phone)
  commit('SET_EMAIL', email)
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

