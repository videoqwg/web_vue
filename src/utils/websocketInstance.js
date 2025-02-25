import WebSocketService from './websocket'

const WebSocketSingleton = (function() {
  let instance
  let id

  function createInstance(userId) {
    const url = `ws://localhost:8080/ws?userId=${userId}`
    id = userId
    return new WebSocketService({
      url,
      autoConnect: true
    })
  }

  return {
    getId: function() {
      return id
    },
    getInstance: function(userId) {
      if (!instance) {
        if (!userId) {
          throw new Error('userId is required to initialize WebSocket instance')
        }
        instance = createInstance(userId)
      }
      return instance
    },
    resetInstance: function() {
      // 重置实例（例如用户登出或切换账户时）
      if (instance) {
        instance.disconnect()
        instance = null
      }
    }
  }
})()

export default WebSocketSingleton
