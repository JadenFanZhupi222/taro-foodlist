import '@nutui/nutui-react-taro/dist/style.css'
import { PropsWithChildren, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Provider } from 'react-redux'
import store from './store'
import { getUser, isLoggedIn } from './utils/auth'
import { setUser, setLoginChecked } from './store/user/userSlice'
import { initApp } from './thunks/initApp'
import AppContainer from './AppContainer'

import './app.scss'

function App({ children }: PropsWithChildren<{}>) {
  // 兼容 AbortController
  if (typeof AbortController === 'undefined') {
    class AbortControllerPolyfill {
      signal: any;
      constructor() {
        this.signal = {
          addEventListener: () => {},
          removeEventListener: () => {},
        };
      }
      abort() {}
    }
    // @ts-ignore
    globalThis.AbortController = AbortControllerPolyfill;
  }
  useEffect(() => {
    async function init() {
      // 初始化云开发环境
      if (process.env.TARO_ENV === 'weapp') {
        Taro.cloud.init({
          env: process.env.TARO_APP_CLOUD_ENV,
          traceUser: true
        })
      }
      // 检查登录状态
      if (isLoggedIn()) {
        const user = getUser()
        if (user) {
          store.dispatch(setUser(user))
          store.dispatch(initApp())
        }
      }
      store.dispatch(setLoginChecked(true))
    }
    init()
  }, [])

  return (
    <Provider store={store}>
      <AppContainer>
        {children}
      </AppContainer>
    </Provider>
  )
}

export default App
