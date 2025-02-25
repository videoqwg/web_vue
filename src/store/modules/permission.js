import { constantRoutes } from '@/router' // 只保留或只引入 constantRoutes
import { getDynamicRoutes } from '@/api/role'

import { convertComponent } from '@/utils/asyncRouter' // 如果你需要映射后端component为前端组件

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

function convertRoutes(routes) {
  const res = []
  routes.forEach(route => {
    let tmp = { ...route }
    // 先把字符串component转换为真正的组件对象
    try {
      tmp = convertComponent(tmp)
    } catch (e) {
      console.log(e)
    }

    // 递归处理子路由
    if (tmp.children && tmp.children.length) {
      tmp.children = convertRoutes(tmp.children)
    }
    res.push(tmp)
  })
  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  },
  SET_HAS_NEW_ROUTE: (state, hasNewRoute) => {
    state.hasNewRoute = hasNewRoute
  }
}

const actions = {
  // roles: 用户角色数组
  async generateRoutes({ commit }, roles) {
    // 1) 调后端接口
    const { data } = await getDynamicRoutes()
    // data 可能是后端返回的路由数组（树形或平铺），假设结构与 asyncRoutes 类似

    // 2) (可选) 把后端的component字符串映射成真正的组件
    const dynamicRoutes = convertRoutes(data)
    // 3) 如果角色包含admin，代表可访问全部
    //    否则过滤
    let accessedRoutes
    if (roles.includes('admin')) {
      accessedRoutes = dynamicRoutes
    } else {
      accessedRoutes = filterAsyncRoutes(dynamicRoutes, roles)
    }

    // 4) 存进Vuex
    commit('SET_ROUTES', accessedRoutes)
    return accessedRoutes
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
