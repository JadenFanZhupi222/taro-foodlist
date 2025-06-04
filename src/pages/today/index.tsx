import { View, Button, Text } from '@tarojs/components'
import { useState, useLayoutEffect, useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import DateSelector from '../../components/DateSelector'
import RecipeCard from '../../components/RecipeCard'
import Loading from '@/components/Loading'
import { SwitchTransition, CSSTransition } from 'react-transition-group'
import { fetchDailyMenus, fetchDailyMenuByDate, createOrUpdateDailyMenu, removeRecipeFromMenu } from '@/thunks/dailyMenu/thunks'
import { selectDailyMenus, selectDailyMenuLoading, selectSelectedRecipes, selectEmptyDates } from '@/store/dailyMenu/selectors'
import { selectFamily } from '@/store/family/selectors'
import { selectRecipes } from '@/store/recipe/selectors'
import { DailyMenuRecipeItem } from '@/store/dailyMenu/types'
import 'taro-ui/dist/style/components/float-layout.scss'
import './index.scss'
import { AppDispatch } from '@/store'
import AddRecipes from '@/components/today/AddRecipes'
import { Recipe } from '@/store/recipe/types'
import { selectUser } from '@/store/user/selectors'
import { removeSelectedRecipe } from '@/store/dailyMenu/dailyMenuSlice'
import { toast } from '@/utils/toast'
import { isSameDay } from '@/utils/date'

const getDateKey = (date: Date) => date.toISOString().slice(0, 10)

const Today = () => {
  const dispatch = useDispatch<AppDispatch>()
  const family = useSelector(selectFamily)
  const dailyMenus = useSelector(selectDailyMenus)
  const loading = useSelector(selectDailyMenuLoading)
  const allRecipes = useSelector(selectRecipes)
  const selectedRecipes = useSelector(selectSelectedRecipes)
  const user = useSelector(selectUser)
  const emptyDates = useSelector(selectEmptyDates)

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [pendingDate, setPendingDate] = useState<Date | null>(null)
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left')
  const [isPlannerOpen, setIsPlannerOpen] = useState(false)
  const [addAnimId, setAddAnimId] = useState<string | null>(null)
  const [hasFetchedToday, setHasFetchedToday] = useState(false)
  const [hasFetchedAll, setHasFetchedAll] = useState(false)

  const addDays = (date: Date, n: number) => {
    const d = new Date(date)
    d.setDate(d.getDate() + n)
    return d
  }

  const prevDate = addDays(selectedDate, -1)
  const nextDate = addDays(selectedDate, 1)
  const dateKey = getDateKey(selectedDate)

  // 当前日期的菜单
  const todayMenu = useMemo(() => 
    dailyMenus.find(m => isSameDay(m.date, dateKey)), [dailyMenus, dateKey])
  const todayRecipes = useMemo(() => {
    if (!todayMenu) return []
    return todayMenu.recipes
      .map((r: DailyMenuRecipeItem) => {
        const recipe = allRecipes.find(item => item._id === r.recipe_id)
        if (!recipe) return null
        // 保证 id、order、image 字段存在
        return {
          ...recipe,
          _id: recipe._id,
          order: r.order,
          image: recipe.image || ''
        }
      })
      .filter(Boolean)
  }, [todayMenu, allRecipes])

  // 进入页面优先拉取今天
  useEffect(() => {
    if (!family?._id) return;
    // 本地是否已有该日期的 dailyMenu 或已知无数据
    const hasMenu = dailyMenus.some(m => isSameDay(m.date, dateKey)) || emptyDates.includes(dateKey);
    if (!hasMenu && !hasFetchedToday) {
      setHasFetchedToday(true);
      dispatch(fetchDailyMenuByDate({ familyId: family._id, date: dateKey }));
    }
  }, [family?._id, dateKey, hasFetchedToday, dailyMenus, emptyDates, dispatch]);

  // 后台异步拉取所有
  useEffect(() => {
    if (
      family?._id &&
      !hasFetchedAll &&
      dailyMenus.length === 0
    ) {
      setHasFetchedAll(true)
      dispatch(fetchDailyMenus({ familyId: family._id }))
    }
  }, [family?._id, hasFetchedAll, dailyMenus.length, dispatch])

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
    setHasFetchedToday(false)
  }

  const handleDateChange = (date: Date) => {
    updateDate(date)
  }

  const handleRecipeClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/recipe/detail/index?id=${id}`
    })
  }

  // 添加菜品
  const handleAddRecipe = useCallback((recipe: Recipe) => {
    // 判断是否已存在
    if (todayMenu && todayMenu.recipes.some(r => r.recipe_id === recipe._id)) {
      toast({ title: '该菜品已在今日菜单中', icon: 'none' })
      return
    }
    setAddAnimId(recipe._id)
    dispatch(createOrUpdateDailyMenu({
      familyId: family?._id || '',
      date: dateKey,
      recipe: { recipe_id: recipe._id },
      userId: user?._id || ''
    }))
    dispatch(removeSelectedRecipe(recipe._id))
    setAddAnimId(null)
  }, [family, dateKey, todayMenu, user, dispatch])

  // 移除菜品
  const handleRemoveRecipe = useCallback((recipe: Recipe) => {
    if (!todayMenu) return
    Taro.showModal({
      title: '确认删除',
      content: '确定要将该菜品移出今日菜单吗？',
      success: (res) => {
        if (res.confirm) {
          dispatch(removeRecipeFromMenu({ menuId: todayMenu._id, recipeId: recipe._id }))
        }
      }
    })
  }, [todayMenu, dispatch])

  const handleArrow = (dir: 'prev' | 'next') => {
    const targetDate = dir === 'prev' ? prevDate : nextDate
    updateDate(targetDate)
  }

  const handleAddPlaceholderClick = () => {
    Taro.navigateTo({ url: '/pages/today/addRecipes/index' })
  }

  // 判断是否为今天以前
  const todayStr = new Date().toISOString().slice(0, 10)
  const selectedStr = selectedDate.toISOString().slice(0, 10)
  const isPast = selectedStr < todayStr
  const isNotToday = !isSameDay(selectedDate, todayStr)

  usePullDownRefresh(() => {
    if (!family?._id) {
      Taro.stopPullDownRefresh()
      return
    }
    dispatch(fetchDailyMenuByDate({ familyId: family._id, date: dateKey }))
      .finally(() => {
        Taro.stopPullDownRefresh()
      })
  })

  return (
    <View className='today-page'>
      <Loading visible={(loading.fetchLoading && isNotToday) || loading.createLoading || loading.fetchDailyLoading || loading.removeLoading} />
      <SwitchTransition mode='out-in'>
        <CSSTransition
          key={dateKey}
          timeout={300}
          classNames={slideDir === 'right' ? 'slide-left' : 'slide-right'}
        >
          <View className='date-selector-bar-with-arrow'>
            <View className='today-arrow today-arrow--left' onClick={() => handleArrow('prev')}>&lt;</View>
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />
            <View className='today-arrow today-arrow--right' onClick={() => handleArrow('next')}>&gt;</View>
          </View>
        </CSSTransition>
      </SwitchTransition>
      <SwitchTransition mode='out-in'>
        <CSSTransition
          key={dateKey}
          timeout={300}
          classNames={slideDir === 'right' ? 'slide-left' : 'slide-right'}
        >
          <View className='recipe-display'>
            {todayRecipes.length === 0 ? (
              <View className='empty-menu'>
                <View className='empty-icon'>🍽️</View>
                <Text>当天菜单暂时为空</Text>
              </View>
            ) : (
              (todayRecipes as NonNullable<typeof todayRecipes[number]>[]).map(recipe => (
                <RecipeCard
                  key={recipe._id}
                  id={recipe._id}
                  name={recipe.name}
                  image={recipe.image}
                  type={recipe.type}
                  className='fade-in-card'
                  onClick={() => handleRecipeClick(recipe._id)}
                  onRemove={() => handleRemoveRecipe(recipe)}
                  showRemove={!isPast}
                />
              ))
            )}
          </View>
        </CSSTransition>
      </SwitchTransition>
      {!isPast && (
        <View className='page-footer'>
          <Button
            className='planner-toggle'
            onClick={() => setIsPlannerOpen(true)}
          >
            添加食谱
          </Button>
          <AddRecipes
            isOpen={isPlannerOpen}
            onClose={() => setIsPlannerOpen(false)}
            availableRecipes={selectedRecipes}
            addAnimId={addAnimId}
            onAddRecipe={handleAddRecipe}
            onAddPlaceholderClick={handleAddPlaceholderClick}
          />
        </View>
      )}
    </View>
  )
}

export default Today
