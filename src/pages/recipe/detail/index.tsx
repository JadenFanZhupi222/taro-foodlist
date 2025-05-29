import { View, Image, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { FC, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectRecipes } from '@/store/recipe/selectors'
import { selectUser } from '@/store/user/selectors'
import { Recipe } from '../../../store/recipe/types'
import './index.scss'

const RecipeDetail: FC = () => {
  const router = useRouter()
  const { id } = router.params
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const recipes = useSelector(selectRecipes)
  const user = useSelector(selectUser)

  useEffect(() => {
    if (id) {
      const foundRecipe = recipes.find(r => r.id === id)
      if (foundRecipe) {
        setRecipe(foundRecipe)
      }
    }
  }, [id, recipes])

  if (!recipe) {
    return (
      <View className='recipe-detail'>
        <Text>食谱不存在</Text>
      </View>
    )
  }

  // 权限判断逻辑（如有更复杂权限可扩展）
  const canEdit = !!user // 这里只判断登录，后续可扩展为更细粒度权限

  return (
    <View className='recipe-detail'>
      <Image className='recipe-detail__image' src={recipe.image} mode='aspectFill' />
      
      <View className='recipe-detail__content'>
        <View className='recipe-detail__header'>
          <Text className='recipe-detail__name'>{recipe.name}</Text>
          <Text className='recipe-detail__type'>{recipe.type}</Text>
        </View>

        <View className='recipe-detail__section'>
          <Text className='recipe-detail__section-title'>食材</Text>
          <View className='recipe-detail__ingredients'>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} className='recipe-detail__ingredient'>
                <Text className='recipe-detail__ingredient-name'>{ingredient.name}</Text>
                <Text className='recipe-detail__ingredient-amount'>{ingredient.amount}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='recipe-detail__section'>
          <Text className='recipe-detail__section-title'>步骤</Text>
          <View className='recipe-detail__steps'>
            {recipe.steps.map((step, index) => (
              <View key={index} className='recipe-detail__step'>
                <Text className='recipe-detail__step-number'>{index + 1}</Text>
                <Text className='recipe-detail__step-content'>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        {canEdit && (
          <Button className='recipe-detail__edit-btn' onClick={() => {
            Taro.navigateTo({
              url: `/pages/recipe/edit/index?id=${recipe.id}`
            })
          }}>
            编辑食谱
          </Button>
        )}
      </View>
    </View>
  )
}

export default RecipeDetail

export const config = {
  navigationBarTitleText: '食谱详情'
} 