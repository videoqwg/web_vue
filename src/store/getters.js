const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  id: state => state.user.id,
  name: state => state.user.name,
  phone: state => state.user.phone,
  email: state => state.user.email,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  permission_routes: state => state.permission.routes,
  errorLogs: state => state.errorLog.logs,
  friends: state => state.user.friends,
  groups: state => state.user.groups,
  messages: state => state.messages.messages,
  newMessages: state => state.messages.newMessages,
  notifications: state => state.notifications.notifications,
  loadMask: state => state.notifications.loadMask
}
export default getters
