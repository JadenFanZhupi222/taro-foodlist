import { PropsWithChildren, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Provider } from 'react-redux'
import store from './store'

import './app.scss'

function App({ children }: PropsWithChildren) {
  // app.tsx 或 index.js 顶部
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
    // 初始化云开发环境
    if (process.env.TARO_ENV === 'weapp') {
      console.log('env', process.env.TARO_APP_CLOUD_ENV)
      Taro.cloud.init({
        env: process.env.TARO_APP_CLOUD_ENV,
        traceUser: true
      })
    }
  }, [])

  // children 是将要会渲染的页面
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}
  


export default App
