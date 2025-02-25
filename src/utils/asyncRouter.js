// src/utils/asyncRouter.js
/*
export function loadView(viewPath) {
  return () => import(`@/views/${viewPath}.vue`)
}
  */
/*
export function loadView(viewPath) {
  const modules = require.context('@/views', true, /\.vue$/)
  console.log(modules.keys()) // 打印所有被加载的文件路径
  const matchedView = modules(`./${viewPath}.vue`)

  if (!matchedView) {
    console.error(`Cannot find module '@/views/${viewPath}.vue'`)
    throw new Error(`Cannot find module '@/views/${viewPath}.vue'`)
  }
  return matchedView
}

export function convertComponent(route) {
  if (route.component === 'Layout') {
    route.component = () => import('@/layout/index.vue')
  } else {
    route.component = loadView(route.component) // 直接调用 loadView
  }
  if (route.children && route.children.length > 0) {
    route.children = route.children.map(child => convertComponent(child)) // 遍历子路由
  }
  return route
}
*/
export function loadView(viewPath) {
  const modules = require.context('@/views', true, /\.vue$/)

  // require.context 加载到的并不是直接的组件本身，而是一个包含 default 的对象
  let matchedView = null
  try {
    matchedView = modules(`./${viewPath}.vue`)
  } catch (e) {
    console.error(e)
    console.log(viewPath)
  }
  // 关键：要返回 matchedView.default
  return matchedView.default
}

export function convertComponent(route) {
  if (route.component === 'Layout') {
    // Layout 这种通常是特殊的布局组件，使用懒加载也行
    route.component = () => import('@/layout/index.vue')
  } else {
    // 直接调用 loadView，注意现在 loadView 返回的是 matchedView.default
    route.component = loadView(route.component)
  }
  /*
  if (route.children && route.children.length > 0) {
    route.children = route.children.map(child => convertComponent(child))
  }
  */
  return route
}
