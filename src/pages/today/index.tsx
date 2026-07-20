import { View, Button, Text } from '@tarojs/components'
import { useState, useLayoutEffect, useEffect, useMemo, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import DateSelector from '@/components/DateSelector'
import RecipeCard from '@/components/RecipeCard'
import Loading from '@/components/Loading'
import { SwitchTransition, CSSTransition } from 'react-transition-group'
import { fetchDailyMenus, fetchDailyMenuByDate, createOrUpdateDailyMenu, removeRecipeFromMenu } from '@/thunks/dailyMenu/thunks'
import { selectDailyMenus, selectDailyMenuLoading, selectSelectedRecipes, selectDateRequests } from '@/store/dailyMenu/selectors'
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
import { isSameDay, toDateKey } from '@/utils/date'
import todayStateModule = require('./todayState')

const { classifyTodayState, getTodayAddAction } = todayStateModule

const getDateKey = (date: Date) => toDateKey(date)

// 与 DateSelector 保持一致的可选日期范围：过去 30 天 ~ 未来 7 天
const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
const MIN_DATE = (() => { const d = startOfToday(); d.setDate(d.getDate() - 30); return d })()
const MAX_DATE = (() => { const d = startOfToday(); d.setDate(d.getDate() + 7); return d })()
const inDateRange = (d: Date) => d >= MIN_DATE && d <= MAX_DATE

// 横向滑动判定阈值
const SWIPE_THRESHOLD = 50

const Today = () => {
  const dispatch = useDispatch<AppDispatch>()
  const family = useSelector(selectFamily)
  const dailyMenus = useSelector(selectDailyMenus)
  const loading = useSelector(selectDailyMenuLoading)
  const allRecipes = useSelector(selectRecipes)
  const selectedRecipes = useSelector(selectSelectedRecipes)
  const user = useSelector(selectUser)
  const dateRequests = useSelector(selectDateRequests)

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [pendingDate, setPendingDate] = useState<Date | null>(null)
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left')
  const [isPlannerOpen, setIsPlannerOpen] = useState(false)
  const [hasFetchedToday, setHasFetchedToday] = useState(false)
  const [hasFetchedAll, setHasFetchedAll] = useState(false)

  useDidShow(() => {
    const page = Taro.getCurrentInstance().page
    ;(page as any)?.getTabBar?.()?.setData({ selected: 1 })
  })

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
        if (!recipe) {
          // 菜谱已被删除：回退到下单时的快照，保住历史记录
          if (r.name) {
            return { _id: r.recipe_id, name: r.name, type: r.type || '其他', image: '', order: r.order }
          }
          return null
        }
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
    // 只要 store 内没有该日期的 dailyMenu，就按日拉取（避免 emptyDates/批量数据不全导致误判）
    const hasMenu = dailyMenus.some(m => isSameDay(m.date, dateKey));
    const requestStatus = dateRequests[dateKey]?.status
    if (!hasMenu && requestStatus !== 'empty' && requestStatus !== 'loading' && !hasFetchedToday) {
      setHasFetchedToday(true);
      dispatch(fetchDailyMenuByDate({ familyId: family._id, date: dateKey }));
    }
  }, [family?._id, dateKey, hasFetchedToday, dailyMenus, dateRequests, dispatch]);

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
    if (!inDateRange(newDate)) return
    setSlideDir(newDate > selectedDate ? 'right' : 'left')
    setPendingDate(newDate)
    setHasFetchedToday(false)
  }

  const handleDateChange = (date: Date) => {
    updateDate(date)
  }

  const canPrev = inDateRange(prevDate)
  const canNext = inDateRange(nextDate)

  // 内容区左右滑动切换日期（右滑→前一天，左滑→后一天）
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const handleTouchStart = (e: any) => {
    const t = e.touches?.[0]
    if (t) touchStartRef.current = { x: t.clientX, y: t.clientY }
  }
  const handleTouchEnd = (e: any) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start) return
    const t = e.changedTouches?.[0]
    if (!t) return
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    // 必须是明显的横向滑动，避免与纵向滚动/点击冲突
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) handleArrow('next')
      else handleArrow('prev')
    }
  }

  const handleRecipeClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/recipe/detail/index?id=${id}`
    })
  }

  // 添加菜品（乐观更新，本地立即可见）
  const handleAddRecipe = useCallback((recipe: Recipe) => {
    const addAction = getTodayAddAction({ userId: user?._id, familyId: family?._id })
    if (addAction !== 'add') return
    if (!user?._id || !family?._id) return
    // 判断是否已存在
    if (todayMenu && todayMenu.recipes.some(r => r.recipe_id === recipe._id)) {
      toast({ title: '该菜品已在今日菜单中', icon: 'none' })
      return
    }
    dispatch(createOrUpdateDailyMenu({
      familyId: family._id,
      date: dateKey,
      recipe: { recipe_id: recipe._id },
      userId: user._id
    }))
    dispatch(removeSelectedRecipe(recipe._id))
  }, [family, dateKey, todayMenu, user, dispatch])

  // 移除菜品（只需 _id，兼容被删菜谱的快照回退项）
  const handleRemoveRecipe = useCallback((recipe: { _id: string }) => {
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

  const handlePlannerAction = () => {
    const addAction = getTodayAddAction({ userId: user?._id, familyId: family?._id })
    if (addAction === 'login') Taro.switchTab({ url: '/pages/profile/index' })
    else if (addAction === 'family') Taro.navigateTo({ url: '/pages/family/index' })
    else setIsPlannerOpen(true)
  }

  const retryDateFetch = () => {
    if (family?._id) dispatch(fetchDailyMenuByDate({ familyId: family._id, date: dateKey }))
  }

  // 判断是否为今天以前
  const todayStr = toDateKey(new Date())
  const selectedStr = toDateKey(selectedDate)
  const isPast = selectedStr < todayStr

  const todayState = classifyTodayState({
    userId: user?._id,
    familyId: family?._id,
    requestStatus: dateRequests[dateKey]?.status,
    menu: todayMenu,
    resolvedRecipeCount: todayRecipes.length
  })

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
      {/* 首屏冷启动（完全无数据时）才用全屏遮罩；切日期/增删均走局部 spinner 与乐观更新 */}
      <Loading visible={loading.fetchLoading && dailyMenus.length === 0} />
      <View className='today-header'>
        <Text className='today-header__eyebrow'>一家人的菜单</Text>
        <Text className='today-header__title'>今天吃什么</Text>
      </View>
      {/* 箭头固定不参与滑动，只有中间日期文字随切换滑动 */}
      <View className='date-selector-bar-with-arrow'>
        <View
          className={`today-arrow today-arrow--left${canPrev ? '' : ' disabled'}`}
          onClick={() => canPrev && handleArrow('prev')}
        >
          <View className='today-arrow__chevron today-arrow__chevron--left' />
        </View>
        <View className='date-bar-center'>
          <SwitchTransition mode='out-in'>
            <CSSTransition
              key={dateKey}
              timeout={220}
              classNames={slideDir === 'right' ? 'slide-left' : 'slide-right'}
            >
              <DateSelector
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
            </CSSTransition>
          </SwitchTransition>
        </View>
        <View
          className={`today-arrow today-arrow--right${canNext ? '' : ' disabled'}`}
          onClick={() => canNext && handleArrow('next')}
        >
          <View className='today-arrow__chevron today-arrow__chevron--right' />
        </View>
      </View>
      <View className='menu-summary'>
        <View>
          <Text className='menu-summary__label'>{isPast ? '历史菜单' : '今日菜单'}</Text>
          <Text className='menu-summary__title'>
            {todayRecipes.length > 0 ? `已经安排 ${todayRecipes.length} 道菜` : '还没有安排菜品'}
          </Text>
        </View>
        <View className='menu-summary__count'>{todayRecipes.length}</View>
      </View>
      <View
        className='recipe-swipe-area'
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <SwitchTransition mode='out-in'>
          <CSSTransition
            key={dateKey}
            timeout={220}
            classNames={slideDir === 'right' ? 'slide-left' : 'slide-right'}
          >
            <View className='recipe-display'>
              {todayState === 'login' ? (
                <View className='empty-menu'><Text>登录后安排今日菜单</Text><Button onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}>去登录</Button></View>
              ) : todayState === 'family' ? (
                <View className='empty-menu'><Text>加入或创建家庭后安排菜单</Text><Button onClick={() => Taro.navigateTo({ url: '/pages/family/index' })}>去建立家庭</Button></View>
              ) : todayState === 'failed' ? (
                <View className='empty-menu'><Text>菜单加载失败，请重试</Text><Button onClick={retryDateFetch}>重试</Button></View>
              ) : todayState === 'resolving' ? (
                <View className='empty-menu'>
                  <View className='loading-content'>
                    <View className='loading-spinner' />
                  </View>
                </View>
              ) : todayState === 'empty' ? (
                <View className='empty-menu'>
                  <View className='empty-icon'>🍽️</View>
                  <Text>当天菜单暂时为空</Text>
                </View>
              ) : (
                <>
                  <View className='menu-list-heading'>
                    <Text>这一天的菜单</Text>
                    {!isPast && <Text className='menu-list-heading__hint'>轻触菜品查看详情</Text>}
                  </View>
                  {(todayRecipes as NonNullable<typeof todayRecipes[number]>[]).map(recipe => (
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
                  ))}
                </>
              )}
            </View>
          </CSSTransition>
        </SwitchTransition>
      </View>
      {!isPast && (
        <View className='page-footer'>
          <Button
            className='planner-toggle'
            onClick={handlePlannerAction}
          >
            ＋ 添加一道菜
          </Button>
          <AddRecipes
            isOpen={isPlannerOpen}
            onClose={() => setIsPlannerOpen(false)}
            availableRecipes={selectedRecipes}
            onAddRecipe={handleAddRecipe}
            onAddPlaceholderClick={handleAddPlaceholderClick}
          />
        </View>
      )}
    </View>
  )
}

export default Today
