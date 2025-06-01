import { View, Button, Text } from '@tarojs/components'
import { AtFloatLayout } from 'taro-ui'
import { useState, useLayoutEffect } from 'react'
import Taro from '@tarojs/taro'
import DateSelector from '../../components/DateSelector'
import RecipeCard from '../../components/RecipeCard'
import { SwitchTransition, CSSTransition } from 'react-transition-group'
import 'taro-ui/dist/style/components/float-layout.scss'
import './index.scss'

const getDateKey = (date: Date) => date.toISOString().slice(0, 10)

const Today = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [pendingDate, setPendingDate] = useState<Date | null>(null) // 👈 新增
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left')
  const [recipesMap, setRecipesMap] = useState({
    [getDateKey(new Date())]: [
      {
        id: '1',
        name: '红烧肉',
        type: '大荤',
        image: 'http://picsum.photos/200.jpg'
      },
      {
        id: '2',
        name: '西红柿炒蛋',
        type: '炒菜',
        image: 'http://picsum.photos/200.jpg'
      }
    ]
  })
  const [availableRecipes, setAvailableRecipes] = useState([
    {
      id: '3',
      name: '清蒸鱼',
      type: '大荤',
      image: 'http://picsum.photos/200.jpg'
    },
    {
      id: '4',
      name: '炒青菜',
      type: '炒菜',
      image: 'http://picsum.photos/200.jpg'
    }
  ])
  const [isPlannerOpen, setIsPlannerOpen] = useState(false)
  const [addAnimId, setAddAnimId] = useState<string | null>(null)

  const addDays = (date: Date, n: number) => {
    const d = new Date(date)
    d.setDate(d.getDate() + n)
    return d
  }

  const prevDate = addDays(selectedDate, -1)
  const nextDate = addDays(selectedDate, 1)

  const getRecipes = (date: Date) => recipesMap[getDateKey(date)] || []

  // 👇 用 useLayoutEffect 保证方向先于 date 更新
  useLayoutEffect(() => {
    if (pendingDate) {
      setSelectedDate(pendingDate)
      setPendingDate(null)
    }
  }, [pendingDate])

  const updateDate = (newDate: Date) => {
    setSlideDir(newDate > selectedDate ? 'right' : 'left')
    setPendingDate(newDate)
  }

  const handleDateChange = (date: Date) => {
    updateDate(date)
  }

  const handleRecipeClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/recipe/detail/index?id=${id}`
    })
  }

  const handleAddRecipe = (recipe) => {
    setAddAnimId(recipe.id)
    setTimeout(() => {
      const key = getDateKey(selectedDate)
      setRecipesMap(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), recipe]
      }))
      setAvailableRecipes(availableRecipes.filter(r => r.id !== recipe.id))
      setAddAnimId(null)
    }, 300)
  }

  const handleRemoveRecipe = (recipe) => {
    const key = getDateKey(selectedDate)
    setRecipesMap(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(r => r.id !== recipe.id)
    }))
    setAvailableRecipes([...availableRecipes, recipe])
  }

  const handleArrow = (dir: 'prev' | 'next') => {
    const targetDate = dir === 'prev' ? prevDate : nextDate
    updateDate(targetDate)
  }

  return (
    <View className='today-page'>
      <View className='today-arrow today-arrow--left' onClick={() => handleArrow('prev')}>&lt;</View>
      <View className='today-arrow today-arrow--right' onClick={() => handleArrow('next')}>&gt;</View>
      <SwitchTransition mode='out-in'>
        <CSSTransition
          key={getDateKey(selectedDate)}
          timeout={300}
          classNames={slideDir === 'right' ? 'slide-left' : 'slide-right'}
        >
          <View>
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />
          </View>
        </CSSTransition>
      </SwitchTransition>
      <SwitchTransition mode='out-in'>
        <CSSTransition
          key={getDateKey(selectedDate)}
          timeout={300}
          classNames={slideDir === 'right' ? 'slide-left' : 'slide-right'}
        >
          <View className='recipe-display'>
            {getRecipes(selectedDate).map(recipe => (
              <RecipeCard
                key={recipe.id}
                className='fade-in-card'
                {...recipe}
                onClick={() => handleRecipeClick(recipe.id)}
                onRemove={() => handleRemoveRecipe(recipe)}
                showRemove
              />
            ))}
          </View>
        </CSSTransition>
      </SwitchTransition>
      <Button
        className='planner-toggle'
        onClick={() => setIsPlannerOpen(true)}
      >
        添加食谱
      </Button>
      <AtFloatLayout
        isOpened={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
      >
        <View className='planner-title'>
          <Text>🍳 添加食谱</Text>
        </View>
        <View className='planner-content'>
          <View className='available-recipes'>
            {availableRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                className={`available-recipe${addAnimId === recipe.id ? ' add-anim' : ''}`}
                {...recipe}
                onClick={() => handleAddRecipe(recipe)}
              />
            ))}
            <View
              className='available-recipe add-placeholder'
            >
              <View className='placeholder-inner'>
                <View className='placeholder-plus'>+</View>
              </View>
            </View>
          </View>
        </View>
      </AtFloatLayout>
    </View>
  )
}

export default Today
