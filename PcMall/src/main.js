import Vue from 'vue'
import iView from 'iview'
import VueRouter from 'vue-router'
import Routers from './router'
// import store from './store/store'
import Util from './libs/util'
import * as Ajax from './services/ajax.es6'
import App from './App'

import store from '@/store/index.js'
import "babel-polyfill"

//省市区三级联动
// import 'vue-area-linkage/dist/index.css'; // v2 or higher
// import VueAreaLinkage from 'vue-area-linkage';

//loading
import VueLoading from 'vue-loading-template'

// Vue.use(VueAreaLinkage);

// config custom iconfonts
Vue.use(VueRouter)
Vue.use(iView)

Vue.use(Ajax.default)
Vue.use(VueLoading, {type:'spiningDubbles'})

// 头像
import Croppa from 'vue-croppa'
Vue.use(Croppa)

// 路由配置
const RouterConfig = {
  // mode: 'history',
  routes: Routers,
  scrollBehavior (to, from, savedPosition) {
    console.log('totototo',to)
    if (savedPosition) {
      return savedPosition
    } else {
      if (!(to.path.indexOf('/pd/')!=-1 && from.path.indexOf('/pd/')!=-1)) {
        return { x: 0, y: 0 }
      }
    }
  },
}
const router = new VueRouter(RouterConfig)

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start()
  sessionStorage.setItem('fromPath', from.path)
  Util.title(to.meta.title)
  // 路由拦截
  let sessionInfo = sessionStorage.getItem('userInfo')
  if (to.meta.intercept) {
    if (sessionInfo) {
      next()
    } else {
      next({path: '/login'})
    }
  } else {
    next()
  }

  // if (to.meta.intercept) {
  //   if (sessionInfo) {
  //     // if (to.path === '')
  //     next()
  //   } else {
  //     // Vue.$vux.confirm.show({
  //     //   content: '用户未登录',
  //     //   confirmText: '去登录',
  //     //   onConfirm: () => {
  //     //     next({path: '/signin'})
  //     //   },
  //     //   onCancel: () => {
  //     //     console.log(to.name)
  //     //     if (['mine', 'mySet', 'myAccount', 'myPassword', 'myInfo', 'myNickname', 'myCollection', 'myOrders', 'myOrderDetail'].indexOf(to.name) !== -1) {
  //     //       next({path: '/mine'})
  //     //     }
  //     //   }
  //     // });
  //     iView.Modal.confirm({
  //       title: '',
  //       content: '<p>用户未登录</p>',
  //       okText: '去登陆',
  //       cancelText: '取消',
  //       onOk: () => {
  //         next({path: '/login'})
  //       },
  //       onCancel: () => {
  //         if (['mine', 'mySet', 'myAccount', 'myPassword', 'myInfo', 'myNickname', 'myCollection', 'myOrders', 'myOrderDetail'].indexOf(to.name) !== -1) {
  //           next({path: '/mine'})
  //         }
  //       }
  //     })
  //   }
  // } else {
  //   next()
  // }
})

router.afterEach(() => {
  iView.LoadingBar.finish()
  // window.scrollTo(0, 0)
})

// 配置Ajax拦截器，处理全局异步请求的交互
Ajax.$interceptor.requestThen = function (config) {
  iView.LoadingBar.start()
  if (config.certified) {
    if (!sessionStorage.getItem('userInfo')) {
      iView.LoadingBar.error()
      iView.Message.error({
        content: `用户未登录，请重新登录!`
      })
      router.replace({path: '/login'})
      if (config.source) {
        config.source.cancel()
      }
      // Promise.cancel()
      return
    }
  }
}

Ajax.$interceptor.requestThen = function (config) {
  iView.LoadingBar.start()
  if (config.certified) {
    if (!sessionStorage.getItem('userInfo')) {
      // Vue.$vux.confirm.show({
      //   content: '用户未登录-收藏',//点击收藏的地方 
      //   confirmText: '去登录-收藏',
      //   onConfirm: () => {
      //     router.push({path: '/signin'})
      //   },
      //   onCancel: () => {
      //     if (['mine', 'mySet', 'myAccount', 'myPassword', 'myInfo', 'myNickname', 'myCollection', 'myOrders', 'myOrderDetail'].indexOf(router.history.current.name) !== -1) {
      //       router.push({path: '/mine'})
      //     } else {
      //       localStorage.removeItem('settlementProductItems')
      //     }
      //   }
      // })
      iView.Modal.confirm({
        title: '',
        content: '<p>用户未登录-收藏</p>',
        okText: '去登录-收藏',
        cancelText: '取消',
        onOk:()=>{
          router.push({path: '/login'})
        },
        onCancel: () => {
          if (['mine', 'mySet', 'myAccount', 'myPassword', 'myInfo', 'myNickname', 'myCollection', 'myOrders', 'myOrderDetail'].indexOf(router.history.current.name) !== -1) {
            router.push({path: '/mine'})
          } else {
            localStorage.removeItem('settlementProductItems')
          }
        }
      })

      if (config.source) {
        config.source.cancel()
      }
      // Promise.cancel()
      return
    }
  }
}

Ajax.$interceptor.responseThen = function (response) {
  let { method, status, data } = response
  switch (true) {
    case /^20\d$/.test(status):
      if (data.code !== undefined) {
        if (data.code === 0) {
          // 业务处理成功（调用Vue.$defaultServiceTip.error）
          iView.LoadingBar.finish()
        } else if (data.code <= 100) {
          // 关键性业务处理错误
          iView.LoadingBar.error()
          iView.Modal.error({
            title: `错误：${data.code}`,
            content: data.message
          })
        } else if (data.code > 1000 && data.code == 6008) {
          // iView.LoadingBar.error()
          // iView.Modal.warning({
          //   title: `错误：${data.code}`,
          //   content: data.message
          // })
          // && [].indexOf(data.code) === -1
          // 其它一般性业务处理错误（调用Vue.$defaultServiceTip.error）
        }
      } else {
        if (method === 'post') {
          iView.LoadingBar.error()
          iView.Modal.error({
            title: '服务器返回错误',
            content: '请刷新页面重试。'
          })
        } else {
          iView.LoadingBar.finish()
        }
      }
      break
    default:
      iView.LoadingBar.error()
      iView.Modal.error({
        title: `服务器错误：${status}`,
        content: '服务器错误！'
      })
      break
  }
}
Ajax.$interceptor.responseCatch = function (error) {
  if (Ajax.$http.isCancel(error)) {
    iView.LoadingBar.update(0)
    setTimeout(() => {
      iView.LoadingBar.destroy()
    }, 200)
  } else {
    iView.LoadingBar.error()
    if (error.response && error.response.status > 0) {
      let status = error.response.status

      switch (true) {
        case /^401$/.test(status):
          sessionStorage.removeItem('userInfo')
          iView.Message.error({
            content: `登录超时，请重新登录!`
          })
          router.replace({path: '/login'})
          break
        case /^403$/.test(status):
          router.replace({path: '/home/noPowerPage'})
          break
        case /^502|504|500$/.test(status):
          iView.Message.error({
            content: `网络状况不佳，请重试：${status}！`,
            duration: 5,
            closable: true
          })
          break
        default:
          iView.Modal.error({
            title: `服务器错误：${status}`,
            content: '服务器错误！'
          })
          break
      }
    } else {
      // iView.Message.error({
      //   content: '网络状况不佳，请重试！',
      //   duration: 5,
      //   closable: true
      // })
    }
  }
}
Ajax.$defaultServiceTip.success = function (response) {
  let { status, data } = response

  if (/^20\d$/.test(status)) {
    if (data.code !== undefined && data.code === 0) {
      iView.Message.success(data.message || '保存成功')
    }
  }
}
Ajax.$defaultServiceTip.error = function (response) {
  let { status, data } = response

  if (/^20\d$/.test(status)) {
    if (data.code !== undefined && data.code > 100) {
      iView.Modal.warning({
        title: `错误：${status}`,
        content: data.message || '数据错误，请重新提交。'
      })
    }
  }
}
Vue.prototype.bus = new Vue()
new Vue({
  router: router,
  store: store,
  render: h => h(App)
}).$mount('#app')

