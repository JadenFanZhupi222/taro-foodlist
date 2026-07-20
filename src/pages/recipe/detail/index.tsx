import { View, Image, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { FC, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectRecipeDetailRequest, selectRecipes } from '@/store/recipe/selectors'
import { selectUser } from '@/store/user/selectors'
import { fetchRecipeById } from '@/thunks/recipe/thunks'
import { AppDispatch } from '@/store'
import * as guestRecipeModule from '@/data/guestRecipes'
import * as recipeDetailContent from './recipeDetailContent'
import StateView from '@/components/StateView'
import './index.scss'

const { findVisibleRecipe, isGuestRecipeId } = guestRecipeModule
const { meaningfulIngredients, meaningfulSteps } = recipeDetailContent

const RecipeDetail: FC = () => {
  const router = useRouter()
  const { id } = router.params
  const recipes = useSelector(selectRecipes)
  const user = useSelector(selectUser)
  const recipe = findVisibleRecipe(recipes, id || '', !!user)
  const detailRequest = useSelector(selectRecipeDetailRequest(id || ''))
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (!user || !id || recipe || isGuestRecipeId(id)) return
    dispatch(fetchRecipeById(id))
  }, [dispatch, id, recipe, user])

  if (!recipe) {
    if (user && id && !isGuestRecipeId(id) && (!detailRequest || detailRequest?.status === 'loading')) {
      return <View className='recipe-detail'><StateView kind='info' title='正在加载食谱' description='请稍候。' /></View>
    }
    if (detailRequest?.status === 'failed') {
      return (
        <View className='recipe-detail'>
          <StateView kind='error' title='食谱加载失败' description='网络可能开了小差，请重试。' actionLabel='重试' onAction={() => dispatch(fetchRecipeById(id!))} />
        </View>
      )
    }
    if (detailRequest?.status === 'not-found' || !user || !id || isGuestRecipeId(id)) {
      return (
        <View className='recipe-detail'>
          <StateView kind='error' title='没有找到这道食谱' description='它可能已被家人移除，返回食谱库看看其他家常味道吧。' actionLabel='返回上一页' onAction={() => Taro.navigateBack()} />
        </View>
      )
    }
    return null
  }

  // 权限判断逻辑（如有更复杂权限可扩展）
  const canEdit = !!user // 这里只判断登录，后续可扩展为更细粒度权限
  const ingredients = meaningfulIngredients(recipe.ingredients)
  const steps = meaningfulSteps(recipe.steps)

  return (
    <View className='recipe-detail'>
      {recipe.image ? (
        <Image className='recipe-detail__image' src={recipe.image} mode='aspectFill' />
      ) : (
        <View className='recipe-detail__image-placeholder'><View className='recipe-detail__plate' /></View>
      )}
      
      <View className='recipe-detail__content'>
        <View className='recipe-detail__header'>
          <Text className='recipe-detail__name'>{recipe.name}</Text>
          <Text className='recipe-detail__type'>{recipe.type}</Text>
        </View>

        {recipe.description && <Text className='recipe-detail__description'>{recipe.description}</Text>}

        <View className='recipe-detail__section'>
          <Text className='recipe-detail__section-title'>食材</Text>
          <View className='recipe-detail__ingredients'>
            {ingredients.length ? ingredients.map((ingredient, index) => (
              <View key={index} className='recipe-detail__ingredient'>
                <Text className='recipe-detail__ingredient-name'>{ingredient.name}</Text>
                <Text className='recipe-detail__ingredient-amount'>{ingredient.amount}</Text>
              </View>
            )) : <Text className='recipe-detail__empty'>暂未填写食材</Text>}
          </View>
        </View>

        <View className='recipe-detail__section'>
          <Text className='recipe-detail__section-title'>步骤</Text>
          <View className='recipe-detail__steps'>
            {steps.length ? steps.map((step, index) => (
              <View key={index} className='recipe-detail__step'>
                <Text className='recipe-detail__step-number'>{index + 1}</Text>
                <Text className='recipe-detail__step-content'>{step}</Text>
              </View>
            )) : <Text className='recipe-detail__empty'>暂未填写步骤</Text>}
          </View>
        </View>

      </View>
      {canEdit && (
        <Button className='recipe-detail__edit-btn' onClick={() => {
          Taro.navigateTo({
            url: `/pages/recipe/edit/index?id=${recipe._id}`
          })
        }}>
          编辑食谱
        </Button>
      )}
    </View>
  )
}

export default RecipeDetail

export const config = {
  navigationBarTitleText: '食谱详情'
}
