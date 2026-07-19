import { View, Text } from '@tarojs/components'
import './index.scss'

interface StateViewProps {
  kind?: 'empty' | 'info' | 'error'
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  compact?: boolean
}

export default function StateView({ kind = 'empty', title, description, actionLabel, onAction, compact = false }: StateViewProps) {
  return (
    <View className={`state-view state-view--${kind}${compact ? ' state-view--compact' : ''}`}>
      <View className='state-view__plate'><View className='state-view__plate-inner' /></View>
      <Text className='state-view__title'>{title}</Text>
      <Text className='state-view__description'>{description}</Text>
      {actionLabel && onAction && <View className='state-view__action' onClick={onAction}>{actionLabel}</View>}
    </View>
  )
}
