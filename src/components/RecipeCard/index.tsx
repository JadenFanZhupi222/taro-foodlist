import { View, Image, Text, MovableArea, MovableView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC, useEffect, useRef, useState } from 'react'
import './index.scss'

const SWIPE_DISTANCE = Taro.getSystemInfoSync().windowWidth * 160 / 750

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
  const [nativeX, setNativeX] = useState(SWIPE_DISTANCE)
  const nativeXRef = useRef(SWIPE_DISTANCE)
  const snapToggleRef = useRef(false)
  const suppressClickUntilRef = useRef(0)
  const isSwipeOpen = activeSwipeId === id

  const snapTo = (target: number) => {
    snapToggleRef.current = !snapToggleRef.current
    const nextX = target + (snapToggleRef.current ? 0.01 : 0)
    nativeXRef.current = target
    setNativeX(nextX)
  }

  const closeSwipe = () => {
    snapTo(SWIPE_DISTANCE)
    onSwipeClose?.(id)
  }

  useEffect(() => {
    if (activeSwipeId !== id && nativeXRef.current < SWIPE_DISTANCE - 1) snapTo(SWIPE_DISTANCE)
  }, [activeSwipeId, id])

  const handleNativeChange = (e: any) => {
    const { x, source } = e.detail || {}
    if (typeof x !== 'number') return
    nativeXRef.current = x
    if (source === 'touch' || source === 'touch-out-of-bounds') {
      suppressClickUntilRef.current = Date.now() + 250
    }
  }

  const handleNativeTouchEnd = () => {
    if (nativeXRef.current < SWIPE_DISTANCE * 0.65) {
      snapTo(0)
      onSwipeOpen?.(id)
    } else {
      closeSwipe()
    }
  }

  const handleCardClick = () => {
    if (Date.now() < suppressClickUntilRef.current) {
      return
    }
    if (isSwipeOpen) {
      closeSwipe()
      return
    }
    onClick?.()
  }

  const handleSwipeDelete = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    closeSwipe()
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
      <View className='recipe-card__swipe-wrap' onTouchEnd={handleNativeTouchEnd}>
        <View className='recipe-card__swipe-sizer' aria-hidden>
          <View className={`recipe-card ${className || ''}`}>
            <View className='recipe-card__media'><View className='recipe-card__placeholder' /></View>
            <View className='recipe-card__content'>
              <Text className='recipe-card__name'>{name}</Text>
              {type ? <Text className='recipe-card__type'>{type}</Text> : null}
            </View>
          </View>
        </View>
        <View className='recipe-card__swipe-action'>
          <View className='recipe-card__swipe-delete' onClick={handleSwipeDelete}><Text>删除</Text></View>
        </View>
        <MovableArea className='recipe-card__swipe-area'>
          <MovableView
            className='recipe-card__swipe-movable'
            direction='horizontal'
            x={nativeX}
            y={0}
            inertia={false}
            outOfBounds={false}
            animation
            onChange={handleNativeChange}
          >
            {cardContent}
          </MovableView>
        </MovableArea>
      </View>
    )
  }
  return cardContent
}

export default RecipeCard
