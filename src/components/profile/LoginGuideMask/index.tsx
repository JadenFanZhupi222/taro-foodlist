import { View, Text } from '@tarojs/components'
import './index.scss'

interface LoginGuideMaskProps {
  onClose: () => void
}

const LoginGuideMask = ({ onClose }: LoginGuideMaskProps) => (
  <View className='login-guide-mask' onClick={onClose}>
    <View className='login-guide-tip-abs'>
      <View className='login-guide-arrow-up' />
      <Text>点击这里用微信登录</Text>
    </View>
  </View>
)

export default LoginGuideMask