import { View, Input, Text } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { useSelector, useDispatch } from 'react-redux'
import { selectRecipes } from '@/store/recipe/selectors'
import { selectUser } from '@/store/user/selectors'
import CategoryNav from '../../components/CategoryNav'
import RecipeCard from '../../components/RecipeCard'
import './index.scss'
import { RECIPE_CATEGORIES } from '@/store/recipe/types'
import { deleteRecipeById } from '@/thunks/recipe/thunks'
import type { AppDispatch } from '@/store'
import Loading from '@/components/Loading'
import { selectRecipeLoading } from '@/store/recipe/selectors'
import SearchBar from '@/components/SearchBar'

const CATEGORIES = ['全部', ...RECIPE_CATEGORIES]

const Index = () => {
  const recipes = useSelector(selectRecipes)
  const user = useSelector(selectUser)
  const familyId = user?.family_id
  const [searchText, setSearchText] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')
  const dispatch = useDispatch<AppDispatch>()
  const { createLoading, deleteLoading } = useSelector(selectRecipeLoading)

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

  // 删除食谱
  const handleDeleteRecipe = (id: string) => {
    if (!familyId) {
      Taro.showToast({ title: '请先加入家庭', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个食谱吗？',
      success: async (res) => {
        if (res.confirm) {
          await dispatch(deleteRecipeById({ familyId, recipeId: id }))
          Taro.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  }

  return (
    <View className='index'>
      <Loading visible={createLoading || deleteLoading} />
      {/* 主要内容区 */}
      <View className='content'>
        <View className='index-search-bar-wrap'>
          <SearchBar
            value={searchText}
            onChange={handleSearch}
            placeholder='搜索食谱'
          />
        </View>
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
              key={recipe._id}
              id={recipe._id}
              name={recipe.name}
              image={recipe.image || ''}
              type={recipe.type}
              onClick={() => handleRecipeClick(recipe._id)}
              swipeToDelete
              onRemove={() => handleDeleteRecipe(recipe._id)}
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
