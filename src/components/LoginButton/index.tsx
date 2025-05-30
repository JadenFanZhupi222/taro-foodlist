import { Button } from '@tarojs/components'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@/store'
import { login, logoutUser, wechatLogin } from '@/thunks/user/thunks'
import { selectIsLoggedIn, selectCode, selectLogoutLoading } from '@/store/user/selectors'
import './index.scss'
import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import Loading from '@/components/Loading'
import { toast } from '@/utils/toast'

interface LoginButtonProps {
  className?: string
}

const LoginButton = ({ className = '' }: LoginButtonProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const code = useSelector(selectCode)
  const logoutLoading = useSelector(selectLogoutLoading)

  useEffect(() => {
    if (code) {
      dispatch(wechatLogin(code))
    }
  }, [code, dispatch])

  // 用户点击登录按钮时，先弹窗说明用途
  const handleLoginClick = () => {
    dispatch(login())
  }

  // 处理退出登录
  const handleLogout = async () => {
    try {
      const { confirm } = await Taro.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        confirmColor: '#ff4d4f'
      })
      
      if (confirm) {
        await dispatch(logoutUser())
      }
    } catch (error) {
      toast({ title: '退出失败', icon: 'none' })
    }
  }

  return isLoggedIn ? (
    <>
      <Button
        className={`login-btn logout ${className}`}
        onClick={handleLogout}
        loading={logoutLoading}
        disabled={logoutLoading}
      >
        退出登录
      </Button>
      <Loading visible={logoutLoading} mask text='正在退出...' />
    </>
  ) : (
    <Button
      className={`login-btn login ${className}`}
      type="primary"
      onClick={handleLoginClick}
    >
      微信登录
    </Button>
  )
}

export default LoginButton