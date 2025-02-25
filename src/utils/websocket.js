/**
 * WebSocketService.js
 *
 * 使用示例:
 *
 * // 1. 创建实例并手动连接
 * const wsService = new WebSocketService({ url: 'ws://localhost:8080/ws' })
 * wsService.connect()
 *
 * // 2. 添加事件监听
 * wsService.addEventListener('open', () => {
 *   console.log('WebSocket open')
 * })
 *
 * wsService.addEventListener('message', (event) => {
 *   console.log('Received:', event.data)
 * })
 *
 * wsService.addEventListener('error', (event) => {
 *   console.error('Error:', event)
 * })
 *
 * wsService.addEventListener('close', (event) => {
 *   console.warn('Closed:', event)
 * })
 *
 * // 3. 发送消息
 * wsService.send('Hello from client!')
 *
 * // 4. 断开连接
 * wsService.disconnect()
 */

export default class WebSocketService {
  /**
     * @param {Object} options 配置对象
     * @param {string} options.url WebSocket服务端地址(必填)
     * @param {number} [options.maxReconnectAttempts=10] 最大重连次数
     * @param {number} [options.initialReconnectDelay=2000] 初始重连延时(ms)
     * @param {number} [options.maxReconnectDelay=30000] 最大重连延时(ms)
     * @param {boolean} [options.autoConnect=false] 是否在实例化后立即连接
     */
  constructor(options = {}) {
    const {
      url = '',
      maxReconnectAttempts = 10,
      initialReconnectDelay = 2000,
      maxReconnectDelay = 30000,
      autoConnect = false
    } = options

    this.url = url
    this.maxReconnectAttempts = maxReconnectAttempts
    this.initialReconnectDelay = initialReconnectDelay
    this.maxReconnectDelay = maxReconnectDelay

    // 连接状态与属性
    this.socket = null
    this.isConnected = false
    this.isReconnecting = false
    this.reconnectAttempts = 0
    this.currentReconnectDelay = this.initialReconnectDelay

    // 事件回调列表
    // key: 事件类型, value: 回调函数数组
    this.callbacks = {
      open: [],
      message: [],
      error: [],
      close: []
    }

    // 是否在实例化时自动连接
    if (autoConnect && this.url) {
      this.connect()
    }
  }

  /**
     * 发起WebSocket连接
     * @param {string} [url] 若传入则覆盖当前this.url
     */
  connect(url) {
    if (url) this.url = url
    if (!this.url) {
      console.error('WebSocket URL is not provided.')
      return
    }

    // 若当前WebSocket已经在连接或已打开, 避免重复发起连接
    if (
      this.socket &&
        (this.socket.readyState === WebSocket.CONNECTING ||
          this.socket.readyState === WebSocket.OPEN)
    ) {
      console.warn('WebSocket is already connecting or open.')
      return
    }

    // 新建WebSocket
    this.socket = new WebSocket(this.url)

    // 绑定原生事件
    this.socket.addEventListener('open', (event) => this._handleOpen(event))
    this.socket.addEventListener('message', (event) => this._handleMessage(event))
    this.socket.addEventListener('error', (event) => this._handleError(event))
    this.socket.addEventListener('close', (event) => this._handleClose(event))
  }

  /**
     * 内部：处理onopen
     * @param {Event} event
     */
  _handleOpen(event) {
    console.log('WebSocket connected to:', this.url)
    this.isConnected = true
    this.isReconnecting = false
    this.reconnectAttempts = 0
    this.currentReconnectDelay = this.initialReconnectDelay

    this._emit('open', event)
  }

  /**
     * 内部：处理onmessage
     * @param {MessageEvent} event
     */
  _handleMessage(event) {
    console.log('WebSocket message received:', event.data)
    this._emit('message', event)
  }

  /**
     * 内部：处理onerror
     * @param {Event} event
     */
  _handleError(event) {
    console.error('WebSocket error:', event)
    this._emit('error', event)
  }

  /**
     * 内部：处理onclose
     * @param {CloseEvent} event
     */
  _handleClose(event) {
    console.warn('WebSocket closed:', event)
    this.isConnected = false
    this._emit('close', event)
    // 若不是主动断开，则发起重连
    this._startReconnect()
  }

  /**
     * 手动断开连接
     */
  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.isConnected = false
    this.isReconnecting = false
    this.reconnectAttempts = 0
    this.currentReconnectDelay = this.initialReconnectDelay
  }

  /**
     * 发送消息
     * @param {string|Blob|ArrayBuffer} data
     */
  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data)
      console.log('WebSocket message sent:', data)
    } else {
      console.warn('WebSocket is not connected or not ready.')
    }
  }

  /**
     * 添加事件监听器
     * @param {'open'|'message'|'error'|'close'} type 事件类型
     * @param {Function} callback 回调函数
     */
  addEventListener(type, callback) {
    if (!this.callbacks[type]) {
      this.callbacks[type] = []
    }

    // 检查是否已存在相同的监听器
    const isAlreadyAdded = this.callbacks[type].some((cb) => cb === callback)
    if (!isAlreadyAdded) {
      this.callbacks[type].push(callback)
    } else {
      console.warn(`Listener for ${type} already exists.`)
    }
  }

  /**
     * 移除事件监听器
     * @param {'open'|'message'|'error'|'close'} type 事件类型
     * @param {Function} callback 回调函数
     */
  removeEventListener(type, callback) {
    if (!this.callbacks[type]) return
    const index = this.callbacks[type].indexOf(callback)
    if (index !== -1) {
      this.callbacks[type].splice(index, 1)
    }
  }

  /**
     * 内部：统一分发事件
     * @param {string} type
     * @param {Event} event
     */
  _emit(type, event) {
    if (!this.callbacks[type]) return
    this.callbacks[type].forEach((cb) => cb(event))
  }

  /**
     * 内部：启动重连逻辑
     */
  _startReconnect() {
    // 避免重复重连或已经连接的情况下继续重连
    if (this.isReconnecting || this.isConnected) {
      return
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached. Giving up.')
      return
    }

    this.isReconnecting = true

    const delay = Math.min(this.currentReconnectDelay, this.maxReconnectDelay)
    console.log(
      `Attempting to reconnect... (Attempt ${this.reconnectAttempts + 1}, Delay: ${delay}ms)`
    )

    setTimeout(() => {
      this.reconnectAttempts++
      this.connect(this.url)

      // 如果重新连接后依旧没连上, 则加大延时并继续重连
      if (!this.isConnected) {
        this.currentReconnectDelay *= 2
        this._startReconnect()
      }
    }, delay)
  }
}
