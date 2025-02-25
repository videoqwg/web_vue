// src/createUserDb.js
import Dexie from 'dexie'

export function createUserDatabase(userId) {
  // 拼上 userId 以区分不同用户
  const dbName = `Database_${userId}`
  const db = new Dexie(dbName)

  // 定义表结构，记录中需要包含一个过期时间字段（如 expiryTime）
  db.version(1).stores({
    messages: '++id, senderId, receiverId, command, commandType, timestamp, processed, expiryTime',
    notifications: '++id, senderId, receiverId, command, commandType, timestamp, processed, expiryTime'
  })

  return db
}

