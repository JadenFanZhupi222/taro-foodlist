import { ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Taro from '@tarojs/taro'
import { selectFamilyLoading } from './store/family/selectors'
import { selectRecipeLoading } from './store/recipe/selectors'

export default function AppContainer({ children }: { children: ReactNode }) {
  const familyLoading = useSelector(selectFamilyLoading)
  const recipeLoadingObj = useSelector(selectRecipeLoading)
  const showLoading = familyLoading || recipeLoadingObj.fetchLoading

  useEffect(() => {
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const route = currentPage?.route
    // 只在首页显示 Loading
    if (route === 'pages/index/index' || route === 'pages/profile/index' || route === 'page/today/index') {
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