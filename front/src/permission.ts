import router from './router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { Message } from 'element-ui'
import { Route } from 'vue-router'
import { UserModule } from '@/store/modules/user'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login']

router.beforeEach((to: Route, _: Route, next: any) => {
  // Start progress bar
  NProgress.start()
  let localId = localStorage.getItem('token')
  if (to.path === '/login') { // 访问login,缓存判断
    if (localId) { // 有缓存，访问主页
      next({ path: '/login' })
    } else { // 无缓存，跳转登录页
      next()
    }
  } else if ((to.path !== '/login') && localId) { // 访问非登录页，有缓存，继续跳转该页面
    next()
  } else if ((to.path !== '/login') && !localId) {
    next({ path: '/login' }) // 访问非登录页，无缓存，跳转login
  }
  // Determine whether the user has logged in
  // if (UserModule.token) {
  //   if (to.path === '/login') {
  //     // If is logged in, redirect to the home page
  //     next({ path: '/' })
  //     NProgress.done()
  //   } else {
  //     // Check whether the user has obtained his permission roles
  //     if (UserModule.roles.length === 0) {
  //       try {
  //         // Get user info, including roles
  //         await UserModule.GetUserInfo()
  //         // Set the replace: true, so the navigation will not leave a history record
  //         next({ ...to, replace: true })
  //       } catch (err) {
  //         // Remove token and redirect to login page
  //         UserModule.ResetToken()
  //         Message.error(err || 'Has Error')
  //         next(`/login?redirect=${to.path}`)
  //         NProgress.done()
  //       }
  //     } else {
  //       next()
  //     }
  //   }
  // } else {
  //   // Has no token
  //   if (whiteList.indexOf(to.path) !== -1) {
  //     // In the free login whitelist, go directly
  //     next()
  //   } else {
  //     // Other pages that do not have permission to access are redirected to the login page.
  //     next(`/login?redirect=${to.path}`)
  //     NProgress.done()
  //   }
  // }
  NProgress.done()
})

router.afterEach((to: Route) => {
  // Finish progress bar
  NProgress.done()

  // set page title
  document.title = to.meta.title
})
