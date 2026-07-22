import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { FC, useEffect, useRef, useState } from 'react'
import './index.scss'

const SWIPE_ACTION_WIDTH = Taro.getSystemInfoSync().windowWidth * 144 / 750
const DIRECTION_THRESHOLD = 6

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
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const offsetRef = useRef(0)
  const touchStartRef = useRef<{ x: number; y: number; offset: number; axis: 'horizontal' | 'vertical' | null } | null>(null)
  const suppressClickUntilRef = useRef(0)
  const isSwipeOpen = activeSwipeId === id

  const updateOffset = (nextOffset: number) => {
    offsetRef.current = nextOffset
    setOffset(nextOffset)
  }

  const closeSwipe = () => {
    updateOffset(0)
    onSwipeClose?.(id)
  }

  useEffect(() => {
    if (activeSwipeId !== id && offsetRef.current !== 0) updateOffset(0)
  }, [activeSwipeId, id])

  const handleTouchStart = (e: any) => {
    const touch = e.touches?.[0]
    if (!touch) return
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      offset: isSwipeOpen ? -SWIPE_ACTION_WIDTH : offsetRef.current,
      axis: null
    }
  }

  const handleTouchMove = (e: any) => {
    const start = touchStartRef.current
    const touch = e.touches?.[0]
    if (!start || !touch) return
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (!start.axis) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < DIRECTION_THRESHOLD) return
      start.axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'horizontal' : 'vertical'
    }
    if (start.axis !== 'horizontal') return
    e.preventDefault?.()
    e.stopPropagation?.()
    suppressClickUntilRef.current = Date.now() + 250
    setDragging(true)
    updateOffset(Math.max(-SWIPE_ACTION_WIDTH, Math.min(0, start.offset + dx)))
  }

  const handleTouchEnd = () => {
    const start = touchStartRef.current
    touchStartRef.current = null
    setDragging(false)
    if (start?.axis !== 'horizontal') return
    if (Math.abs(offsetRef.current) > SWIPE_ACTION_WIDTH * 0.35) {
      updateOffset(-SWIPE_ACTION_WIDTH)
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
      <View
        className='recipe-card__swipe-wrap'
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <View
          className='recipe-card__swipe-track'
          style={{
            transform: `translate3d(${offset}px, 0, 0)`,
            transitionDuration: dragging ? '0ms' : '180ms'
          }}
        >
          {cardContent}
          <View className='recipe-card__swipe-action'>
            <View className='recipe-card__swipe-delete' onClick={handleSwipeDelete}>
              <Text>删除</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }
  return cardContent
}

export default RecipeCard
