import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Taro from '@tarojs/taro'
import { selectRecipes } from '@/store/recipe/selectors'
import { toast } from '@/utils/toast'
import { setSelectedRecipes } from '@/store/dailyMenu/dailyMenuSlice'
import './index.scss'
import CategoryNav from '@/components/CategoryNav'
import RecipeCard from '@/components/RecipeCard'
import SearchBar from '@/components/SearchBar'
import { RECIPE_CATEGORIES } from '@/store/recipe/types'
import { selectSelectedRecipes } from '@/store/dailyMenu/selectors'

const CATEGORIES = ['全部', ...RECIPE_CATEGORIES]

const AddRecipes = () => {
  const allRecipes = useSelector(selectRecipes)
  const selectedRecipes = useSelector(selectSelectedRecipes)
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedRecipes.map(r => r._id))
  const [searchText, setSearchText] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')
  const dispatch = useDispatch()

  const handleCardClick = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSave = () => {
    const selectedRecipes = allRecipes.filter(r => selectedIds.includes(r._id))
    dispatch(setSelectedRecipes(selectedRecipes))
    toast({ title: `已选择${selectedRecipes.length}个`, icon: 'success' })
    Taro.navigateBack()
  }

  // 分类和搜索双重过滤
  const filteredRecipes = allRecipes.filter(recipe => {
    const matchCategory = activeCategory === '全部' || recipe.type === activeCategory
    const matchSearch = recipe.name.toLowerCase().includes(searchText.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <View className='add-recipes-page'>
      <View className='add-recipes-search-bar'>
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder='搜索食谱'
        />
      </View>
      <View className='add-recipes-content'>
        <View className='add-recipes-category-nav'>
          <CategoryNav
            categories={CATEGORIES}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </View>
        <View className='add-recipes-list'>
          {filteredRecipes.length === 0 ? (
            <View className='add-recipes-empty'>
              <View className='add-recipes-empty-icon'>🍽️</View>
              <Text className='add-recipes-empty-text'>暂无可选菜谱</Text>
            </View>
          ) : (
            filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe._id}
                id={recipe._id}
                name={recipe.name}
                image={recipe.image || ''}
                type={recipe.type}
                onClick={() => handleCardClick(recipe._id)}
                selected={selectedIds.includes(recipe._id)}
              />
            ))
          )}
        </View>
      </View>
      <View className='add-recipes-footer'>
        <View className='add-recipes-save-btn' onClick={handleSave}>
          保存
        </View>
        <Text className='add-recipes-footer-stats'>已选择 {selectedIds.length} / {allRecipes.length}</Text>
      </View>
    </View>
  )
}

export default AddRecipes 