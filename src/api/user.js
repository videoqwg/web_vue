import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function getUserData() {
  return request({
    url: '/user/getUserData',
    method: 'get'
  })
}

export function getFriends() {
  return request({
    url: '/user/getFriends',
    method: 'get'
  })
}

export function addFriend(data) {
  return request({
    url: '/user/addFriend',
    method: 'post',
    data
  })
}

export function getGroups() {
  return request({
    url: '/user/getGroups',
    method: 'get'
  })
}

export function updateUserData(data) {
  return request({
    url: '/user/updateUserData',
    method: 'post',
    data
  })
}

export function updateAccountData(data) {
  return request({
    url: '/user/updateAccountData',
    method: 'post',
    data
  })
}

export function loadMessages() {
  return request({
    url: '/user/loadMessages',
    method: 'get'
  })
}

export function getFriendInfo(data) {
  return request({
    url: '/user/getFriendInfo',
    method: 'post',
    data
  })
}

export function sendCommand(data) {
  return request({
    url: '/user/sendCmd',
    method: 'post',
    data
  })
}

export function sendGroupCommand(data) {
  return request({
    url: '/user/sendGroupCmd',
    method: 'post',
    data
  })
}

// 同步消息
export function syncMessages(data) {
  return request({
    url: '/user/syncMessages',
    method: 'post',
    data
  })
}

export function syncNotifications(data) {
  return request({
    url: '/user/syncNotifications',
    method: 'post',
    data
  })
}

