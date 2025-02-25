import request from '@/utils/request'

export function getRoutes() {
  return request({
    url: '/routes/getAllRoutes',
    method: 'get'
  })
}

export function getRoles() {
  return request({
    url: '/routes/getAllRoles',
    method: 'get'
  })
}

export function addRole(data) {
  return request({
    url: '/vue-element-admin/role',
    method: 'post',
    data
  })
}

export function updateRole(id, data) {
  return request({
    url: `/routes/role/${id}`,
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `/vue-element-admin/role/${id}`,
    method: 'delete'
  })
}

export function getDynamicRoutes() {
  return request({
    url: '/routes/routesByRoles', // 后端返回路由的地址
    method: 'get'
  })
}
