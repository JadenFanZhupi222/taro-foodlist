import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import { useSelector, useDispatch } from 'react-redux'
import { selectRecipes } from '@/store/recipe/selectors'
import { selectUser } from '@/store/user/selectors'
import CategoryNav from '../../components/CategoryNav'
import RecipeCard from '../../components/RecipeCard'
import './index.scss'
import { RECIPE_CATEGORIES } from '@/store/recipe/types'
import { deleteRecipeById, fetchRecipes } from '@/thunks/recipe/thunks'
import type { AppDispatch } from '@/store'
import Loading from '@/components/Loading'
import { selectRecipeLoading } from '@/store/recipe/selectors'
import SearchBar from '@/components/SearchBar'
import * as guestRecipeModule from '@/data/guestRecipes'
import * as recipeDeletionModule from './recipeDeletion'

const CATEGORIES = ['全部', ...RECIPE_CATEGORIES]
const { getVisibleRecipes } = guestRecipeModule
const { runRecipeDeletion } = recipeDeletionModule

const Index = () => {
  const recipes = useSelector(selectRecipes)
  const user = useSelector(selectUser)
  const isGuest = !user
  const visibleRecipes = getVisibleRecipes(recipes, !!user)
  const familyId = user?.family_id
  const [searchText, setSearchText] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')
  const [openRecipeId, setOpenRecipeId] = useState<string | null>(null)
  const dispatch = useDispatch<AppDispatch>()
  const { fetchLoading } = useSelector(selectRecipeLoading)

  useDidShow(() => {
    const page = Taro.getCurrentInstance().page
    ;(page as any)?.getTabBar?.()?.setData({ selected: 0 })
  })

  // 处理下拉刷新
  usePullDownRefresh(async () => {
    if (!familyId) {
      Taro.stopPullDownRefresh()
      return
    }
    dispatch(fetchRecipes(familyId))
      .finally(() => {
        Taro.stopPullDownRefresh()
      })
  })

  // 处理搜索
  const handleSearch = (value: string) => {
    setOpenRecipeId(null)
    setSearchText(value)
  }

  // 处理分类选择
  const handleCategorySelect = (category: string) => {
    setOpenRecipeId(null)
    setActiveCategory(category)
  }

  // 过滤食谱
  const filteredRecipes = visibleRecipes.filter(recipe => {
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
    if (isGuest) {
      Taro.switchTab({
        url: '/pages/profile/index'
      })
      return
    }
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
          await runRecipeDeletion({
            remove: async () => dispatch(deleteRecipeById({ familyId, recipeId: id })).unwrap(),
            onSuccess: () => Taro.showToast({ title: '删除成功', icon: 'success' }),
            onFailure: () => Taro.showToast({ title: '删除失败', icon: 'error' })
          })
        }
      }
    })
  }

  return (
    <View className='index'>
      {/* 仅首屏冷启动（无任何食谱时）用全屏遮罩；增删走 toast 反馈，不再全屏挡屏 */}
      <Loading visible={!isGuest && fetchLoading && visibleRecipes.length === 0} />
      <View className='index-header'>
        <View>
          <Text className='index-eyebrow'>{visibleRecipes.length} 道{isGuest ? '体验' : '家庭'}食谱</Text>
          <Text className='index-title'>家的食谱</Text>
        </View>
        <View className='index-create' onClick={handleAddRecipe}>
          <Text className='index-create__plus'>＋</Text>
          <Text>新建</Text>
        </View>
      </View>
      <View className='content'>
        {isGuest && (
          <View className='index-guest-banner'>
            <View>
              <Text className='index-guest-banner__title'>游客体验 · 只读浏览</Text>
              <Text className='index-guest-banner__copy'>以下是示例食谱，登录后即可创建和管理你的家庭食谱。</Text>
            </View>
            <Text className='index-guest-banner__action' onClick={handleAddRecipe}>去登录</Text>
          </View>
        )}
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
          {filteredRecipes.length === 0 ? (
            <View className='index-empty'>
              <View className='index-empty__plate' />
              <Text className='index-empty__title'>{visibleRecipes.length === 0 ? '还没有家庭食谱' : '没有找到相关食谱'}</Text>
              <Text className='index-empty__hint'>{visibleRecipes.length === 0 ? '先记下家里最常做的一道菜' : '试试其他关键词或分类'}</Text>
              {visibleRecipes.length === 0 && <View className='index-empty__action' onClick={handleAddRecipe}>新建第一道食谱</View>}
            </View>
          ) : filteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe._id}
              id={recipe._id}
              name={recipe.name}
              image={recipe.image || ''}
              // 已按分类筛选时，卡片上的分类标签是冗余的，仅在「全部」视图展示
              type={activeCategory === '全部' ? recipe.type : ''}
              onClick={() => handleRecipeClick(recipe._id)}
              swipeToDelete={!isGuest}
              activeSwipeId={openRecipeId}
              onSwipeOpen={setOpenRecipeId}
              onRemove={isGuest ? undefined : () => handleDeleteRecipe(recipe._id)}
            />
          ))}
        </View>
      </View>

    </View>
  )
}

export default Index
