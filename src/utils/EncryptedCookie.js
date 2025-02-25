import Cookies from 'js-cookie'
import CryptoJS from 'crypto-js'

// 加密和存储数据
export function setEncryptedCookie(key, data, options = {}) {
  const secretKey = process.env.VUE_APP_SECRET_KEY
  // 将数据加密为字符串
  const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString()
  // 存储到 Cookies
  Cookies.set(key, encryptedData, { ...options })
}

// 解密和读取数据
export function getDecryptedCookie(key) {
  const secretKey = process.env.VUE_APP_SECRET_KEY
  // 从 Cookies 中读取加密数据
  const encryptedData = Cookies.get(key)
  if (!encryptedData) return null

  try {
    // 解密数据
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey)
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
    return decryptedData
  } catch (error) {
    console.error('Failed to decrypt cookie data:', error)
    return null
  }
}

// 删除 Cookie
export function removeCookie(key) {
  Cookies.remove(key)
}
