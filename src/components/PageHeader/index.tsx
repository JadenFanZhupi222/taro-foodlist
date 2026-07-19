import type { ReactNode } from 'react'
import { View, Text } from '@tarojs/components'
import './index.scss'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}

export default function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <View className='page-header'>
      <View className='page-header__copy'>
        {eyebrow && <Text className='page-header__eyebrow'>{eyebrow}</Text>}
        <Text className='page-header__title'>{title}</Text>
        {description && <Text className='page-header__description'>{description}</Text>}
      </View>
      {action && <View className='page-header__action'>{action}</View>}
    </View>
  )
}
