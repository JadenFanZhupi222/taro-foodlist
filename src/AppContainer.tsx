import { ReactNode, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Taro from '@tarojs/taro'
import { selectFamilyLoading } from './store/family/selectors'
import { selectIsLoggedIn } from './store/user/selectors'
import { selectLoginChecked } from './store/user/selectors'
import { AppDispatch } from './store'
import { setGuideLogin } from '@/store/user/userSlice'

export default function AppContainer({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const familyLoading = useSelector(selectFamilyLoading)
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const loginChecked = useSelector(selectLoginChecked)
  const modalShown = useRef(false)
  const showLoading = familyLoading

  useEffect(() => {
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const route = currentPage?.route
    // 登录引导
    if (loginChecked && !isLoggedIn && !modalShown.current && route !== 'pages/family/acceptInvite/index') {
      modalShown.current = true
      Taro.showModal({
        title: '未登录',
        content: '需要登录后才能使用全部功能，是否立即登录？',
        confirmText: '去登录',
        cancelText: '暂不',
        success: (res) => {
          if (res.confirm) {
            Taro.switchTab({ url: '/pages/profile/index' })
            dispatch(setGuideLogin(true))
          }
        }
      })
    }
  }, [loginChecked])

  useEffect(() => {
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const route = currentPage?.route
    // 只在首页显示 Loading
    if (route === 'pages/index/index' || route === 'pages/profile/index' || route === 'pages/today/index') {
      if (showLoading) {
        Taro.showLoading({ title: '加载中...', mask: true })
      } else {
        Taro.hideLoading()
      }
      // 组件卸载时确保 Loading 被关闭
      return () => {
        Taro.hideLoading()
      }
    }
  }, [showLoading])

  return <>{children}</>
} 