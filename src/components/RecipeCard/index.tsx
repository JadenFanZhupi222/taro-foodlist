import { View, Image, Text } from '@tarojs/components'
import { FC } from 'react'
import './index.scss'

interface RecipeCardProps {
  id: string
  name: string
  image: string
  type: string
  onClick?: () => void
  onRemove?: () => void
  showRemove?: boolean
  className?: string
}

const RecipeCard: FC<RecipeCardProps> = ({ id, name, image, type, onClick, onRemove, showRemove, className }) => {
  return (
    <View className={`recipe-card ${className || ''}`} onClick={onClick}>
      <Image className='recipe-card__image' src={image} mode='aspectFill' />
      <View className='recipe-card__divider' />
      <View className='recipe-card__content'>
        <Text className='recipe-card__name'>{name}</Text>
        <Text className='recipe-card__type'>{type}</Text>
        {showRemove && onRemove && (
          <View className='recipe-card__remove' onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}>×</View>
        )}
      </View>
    </View>
  )
}

export default RecipeCard 