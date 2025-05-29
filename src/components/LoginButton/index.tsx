import { Button } from '@tarojs/components'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@/store'
import { login, logoutUser, wechatLogin } from '@/thunks/user/thunks'
import { selectIsLoggedIn, selectCode } from '@/store/user/selectors'
import './index.scss'
import { useEffect } from 'react'

interface LoginButtonProps {
  className?: string
}

const LoginButton = ({ className = '' }: LoginButtonProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const code = useSelector(selectCode)
  console.log('code', code)

  useEffect(() => {
    if (code) {
      dispatch(wechatLogin(code))
    }
  }, [code, dispatch])

  // 用户点击登录按钮时，先弹窗说明用途
  const handleLoginClick = () => {
    console.log('click login')
    dispatch(login())
  }

  // 处理退出登录
  const handleLogout = () => {
    dispatch(logoutUser())
  }

  return isLoggedIn ? (
    <Button
      className={`login-btn logout ${className}`}
      onClick={handleLogout}
    >
      退出登录
    </Button>
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