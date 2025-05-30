import { View, Text } from '@tarojs/components'
import './index.scss'

interface LoadingProps {
  visible: boolean
  text?: string
  mask?: boolean // true=全屏遮罩，false=局部
}

export default function Loading({ visible, text = '加载中...', mask = true }: LoadingProps) {
  if (!visible) return null
  return mask ? (
    <View className='loading-mask'>
      <View className='loading-content'>
        <View className='loading-spinner' />
        <Text className='loading-text'>{text}</Text>
      </View>
    </View>
  ) : (
    <View className='loading-content' style={{ minHeight: '4rem', justifyContent: 'center' }}>
      <View className='loading-spinner' />
      <Text className='loading-text'>{text}</Text>
    </View>
  )
} 