import { View, Image, Text } from '@tarojs/components'
import { FC, useEffect, useRef } from 'react'
import { Swipe } from '@nutui/nutui-react-taro'
import type { SwipeRef } from '@nutui/nutui-react-taro'
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
  selected?: boolean
  activeSwipeId?: string | null
  onSwipeOpen?: (id: string | null) => void
  onSwipeClose?: (id: string) => void
}

const RecipeCard: FC<RecipeCardProps> = ({ id, name, image, type, onClick, onRemove, showRemove, className, swipeToDelete, selected, activeSwipeId, onSwipeOpen, onSwipeClose }) => {
  const swipeRef = useRef<SwipeRef>(null)
  const isSwipeOpen = activeSwipeId === id

  useEffect(() => {
    if (activeSwipeId !== id) swipeRef.current?.close()
  }, [activeSwipeId, id])

  const handleCardClick = () => {
    if (isSwipeOpen) {
      swipeRef.current?.close()
      onSwipeClose?.(id)
      return
    }
    onClick?.()
  }

  const handleSwipeDelete = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    swipeRef.current?.close()
    onSwipeClose?.(id)
    onRemove?.()
  }

  const cardContent = (
    <View className={`recipe-card ${className || ''}`} onClick={handleCardClick}>
      <View className='recipe-card__media'>
        {image ? <Image className='recipe-card__image' src={image} mode='aspectFill' /> : (
          <View className='recipe-card__placeholder'>
            <View className='recipe-card__placeholder-plate' />
          </View>
        )}
      </View>
      <View className='recipe-card__content'>
        <Text className='recipe-card__name'>{name}</Text>
        {type ? <Text className='recipe-card__type'>{type}</Text> : null}
        {showRemove && onRemove && (
          <View className='recipe-card__remove' onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}>移除</View>
        )}
      </View>
      {selected && (
        <View className='recipe-card__selected-mask'>
          <View className='recipe-card__selected-icon'>✔</View>
        </View>
      )}
    </View>
  )

  if (swipeToDelete && onRemove) {
    return (
      <Swipe
        ref={swipeRef}
        name={id}
        onOpen={() => onSwipeOpen?.(id)}
        onClose={() => onSwipeClose?.(id)}
        rightAction={
          <View
            className='recipe-card__swipe-delete'
            onClick={handleSwipeDelete}
          >
            <Text>删除</Text>
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
