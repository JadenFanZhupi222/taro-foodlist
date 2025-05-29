import { View, Input, Text } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { useSelector } from 'react-redux'
import { selectRecipes } from '@/store/recipe/selectors'
import CategoryNav from '../../components/CategoryNav'
import RecipeCard from '../../components/RecipeCard'
import './index.scss'

const CATEGORIES = ['全部', '大荤', '小荤', '炒菜', '汤类', '其他']

const Index = () => {
  const recipes = useSelector(selectRecipes)
  const [searchText, setSearchText] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value)
  }

  // 处理分类选择
  const handleCategorySelect = (category: string) => {
    setActiveCategory(category)
  }

  // 过滤食谱
  const filteredRecipes = recipes.filter(recipe => {
    const matchSearch = recipe.name.toLowerCase().includes(searchText.toLowerCase())
    const matchCategory = activeCategory === '全部' || recipe.type === activeCategory
    return matchSearch && matchCategory
  })

  // 处理食谱点击
  const handleRecipeClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/recipe/detail/index?id=${id}`
    })
  }

  // 处理新建食谱
  const handleAddRecipe = () => {
    Taro.navigateTo({
      url: '/pages/recipe/edit/index'
    })
  }

  return (
    <View className='index'>
      {/* 搜索栏 */}
      <View className='search-bar'>
        <Input
          className='search-input'
          type='text'
          placeholder='搜索食谱'
          value={searchText}
          onInput={e => handleSearch(e.detail.value)}
        />
      </View>

      {/* 主要内容区 */}
      <View className='content'>
        {/* 左侧分类栏 */}
        <CategoryNav
          categories={CATEGORIES}
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
        />

        {/* 右侧食谱列表 */}
        <View className='recipe-list'>
          {filteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              name={recipe.name}
              image={recipe.image}
              type={recipe.type}
              onClick={() => handleRecipeClick(recipe.id)}
            />
          ))}
        </View>
      </View>

      {/* 新建食谱按钮 */}
      <View className='add-recipe' onClick={handleAddRecipe}>
        <Text className='add-recipe__icon'>+</Text>
      </View>
    </View>
  )
}

export default Index
