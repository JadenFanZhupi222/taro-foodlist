import { View, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import DateSelector from '../../components/DateSelector'
import RecipeCard from '../../components/RecipeCard'
import './index.scss'

const Today = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [recipes, setRecipes] = useState([
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
  ])
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

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    // TODO: 根据日期加载食谱数据
  }

  const handleRecipeClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/recipe/detail/index?id=${id}`
    })
  }

  const handleAddRecipe = (recipe) => {
    setAddAnimId(recipe.id)
    setTimeout(() => {
      setRecipes([...recipes, recipe])
      setAvailableRecipes(availableRecipes.filter(r => r.id !== recipe.id))
      setAddAnimId(null)
    }, 300)
  }

  const handleRemoveRecipe = (recipe) => {
    setRecipes(recipes.filter(r => r.id !== recipe.id))
    setAvailableRecipes([...availableRecipes, recipe])
  }

  const togglePlanner = () => {
    setIsPlannerOpen(!isPlannerOpen)
  }

  return (
    <View className='today-page'>
      <DateSelector 
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />
      <View className='recipe-display'>
        {recipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            {...recipe}
            onClick={() => handleRecipeClick(recipe.id)}
            onRemove={() => handleRemoveRecipe(recipe)}
            showRemove
          />
        ))}
      </View>
      <View className='recipe-planner'>
        <Button 
          className='planner-toggle'
          onClick={togglePlanner}
        >
          {isPlannerOpen ? '收起' : '添加食谱'}
        </Button>
        {isPlannerOpen && (
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
                style={{ cursor: 'pointer' }}
                // onClick 预留
              >
                <View className='placeholder-inner'>
                  <View className='placeholder-plus'>+</View>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

export default Today 