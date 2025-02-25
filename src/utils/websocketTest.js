class WebSocketService {
  constructor() {
    this.socket = null // WebSocket 对象
    this.url = '' // WebSocket 地址
    this.isConnected = false // 是否已连接
    this.isReconnecting = false // 是否正在重连
    this.reconnectAttempts = 0 // 当前重连次数
    this.maxReconnectAttempts = 10 // 最大重连次数
    this.reconnectDelay = 2000 // 初始重连间隔（毫秒）
    this.maxReconnectDelay = 30000 // 最大重连间隔（毫秒）
    this.messageCallback = null // 消息回调
    this.errorCallback = null // 错误回调
  }

  /**
     * 连接 WebSocket
     * @param {string} url - WebSocket 服务地址
     */
  connect(url) {
    if (this.socket) {
      console.warn('WebSocket is already connected or connecting.')
      return
    }

    this.url = url
    this.socket = new WebSocket(url)

    // WebSocket 打开事件
    this.socket.onopen = () => {
      console.log('WebSocket connected.')
      this.isConnected = true
      this.isReconnecting = false
      this.reconnectAttempts = 0 // 重置重连次数
    }

    // WebSocket 消息事件
    this.socket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data)
      if (this.messageCallback) {
        this.messageCallback(event.data) // 触发消息回调
      }
    }

    // WebSocket 错误事件
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error)
      if (this.errorCallback) {
        this.errorCallback(error) // 触发错误回调
      }
      this.startReconnect() // 触发重连
    }

    // WebSocket 关闭事件
    this.socket.onclose = () => {
      console.warn('WebSocket closed.')
      this.isConnected = false
      this.startReconnect() // 触发重连
    }
  }

  /**
     * 断开 WebSocket 连接
     */
  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.isConnected = false
    this.isReconnecting = false
    this.reconnectAttempts = 0
  }

  /**
     * 发送消息
     * @param {string} message - 要发送的消息
     */
  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message)
      console.log('Message sent:', message)
    } else {
      console.warn('WebSocket is not connected or ready.')
    }
  }

  /**
     * 设置消息回调函数
     * @param {Function} callback - 回调函数
     */
  onMessage(callback) {
    this.messageCallback = callback
  }

  /**
     * 设置错误回调函数
     * @param {Function} callback - 回调函数
     */
  onError(callback) {
    this.errorCallback = callback
  }

  /**
     * 开始重连逻辑
     */
  startReconnect() {
    if (this.isReconnecting || this.isConnected) {
      return // 避免重复重连
    }

    this.isReconnecting = true

    const tryReconnect = () => {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnect attempts reached. Giving up.')
        this.isReconnecting = false
        return
      }

      const delay = Math.min(
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
        this.maxReconnectDelay
      ) // 指数递增的重连间隔（最大不超过 maxReconnectDelay）

      console.log(
        `Attempting to reconnect... (Attempt ${this.reconnectAttempts + 1}, Delay: ${delay}ms)`
      )

      setTimeout(() => {
        this.reconnectAttempts++
        this.connect(this.url)

        if (!this.isConnected) {
          tryReconnect() // 如果连接失败，继续尝试重连
        }
      }, delay)
    }

    tryReconnect()
  }
}

// 创建单例实例
const webSocketService = new WebSocketService()
export default webSocketService
