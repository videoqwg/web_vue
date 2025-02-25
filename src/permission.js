import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import WebSocketSingleton from '@/utils/websocketInstance'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/register', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  console.log('BeforeEach: Start')
  // start progress bar
  NProgress.start()
  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      // determine whether the user has obtained his permission roles through getInfo
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          // get user info
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          const { roles } = await store.dispatch('user/getInfo')
          // 添加websocket监听器
          const wsInstance = WebSocketSingleton.getInstance(store.getters.id)
          wsInstance.addEventListener('message', (event) => {
            const command = JSON.parse(event.data)
            if (command.senderId !== store.getters.id) {
              // 使用 context.dispatch 调用 messages 模块的 action
              if (command.commandType === 'chat') {
                store.dispatch('messages/saveMessage', { message: command, userId: WebSocketSingleton.getId() })
              } else if (command.commandType === 'notification') {
                store.dispatch('notifications/saveNotification', { notification: command, userId: WebSocketSingleton.getId() })
              }
            }
          })

          // generate accessible routes map based on roles
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
          // dynamically add accessible routes
          // router.addRoutes(accessRoutes)
          // 在动态路由加载完后再添加 '*'
          router.addRoutes([...accessRoutes, { path: '*', redirect: '/404', hidden: true }])

          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          // next({ ...to, replace: true })
          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
