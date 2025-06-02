import { View, Image, Text } from '@tarojs/components'
import { FC } from 'react'
import { Swipe } from '@nutui/nutui-react-taro'
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
  swipeToDelete?: boolean
}

const RecipeCard: FC<RecipeCardProps> = ({ name, image, type, onClick, onRemove, showRemove, className, swipeToDelete }) => {
  const cardContent = (
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
          }}>x</View>
        )}
      </View>
    </View>
  )

  if (swipeToDelete && onRemove) {
    return (
      <Swipe
        rightAction={
          <View
            className='recipe-card__swipe-delete'
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          >
            <Text>删</Text>
            <Text>除</Text>
          </View>
        }
        className='recipe-card__swipe-wrap'
      >
        {cardContent}
      </Swipe>
    )
  }
  return cardContent
}

export default RecipeCard 