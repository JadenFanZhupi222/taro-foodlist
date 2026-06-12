import { View, Text } from '@tarojs/components'
import { AtFloatLayout } from 'taro-ui'
import RecipeCard from '@/components/RecipeCard'
import { Recipe } from '@/store/recipe/types'
import './index.scss'

interface AddRecipesProps {
  isOpen: boolean
  onClose: () => void
  availableRecipes: Recipe[]
  onAddRecipe: (recipe: Recipe) => void
  onAddPlaceholderClick: () => void
}

const AddRecipes = ({ isOpen, onClose, availableRecipes, onAddRecipe, onAddPlaceholderClick }: AddRecipesProps) => {
  const AddPlaceholder = (
    <View className='available-recipe add-placeholder' onClick={onAddPlaceholderClick}>
      <View className='placeholder-inner'>
        <View className='placeholder-plus'>+</View>
      </View>
    </View>
  );

  return (
    <AtFloatLayout
      isOpened={isOpen}
      onClose={onClose}
    >
      <View className='planner-title'>
        <Text>🍳 添加食谱</Text>
      </View>
      <View className='planner-content'>
        {availableRecipes.length === 0 ? (
          <>
            <View className='empty-tip'>请点击加号添加可用菜谱</View>
            {AddPlaceholder}
          </>
        ) : (
          <View className='available-recipes'>
            {availableRecipes.map(recipe => (
              <RecipeCard
                key={recipe._id}
                id={recipe._id}
                name={recipe.name}
                image={recipe.image || ''}
                type={recipe.type}
                className='available-recipe available-recipe--tappable'
                onClick={() => onAddRecipe(recipe)}
              />
            ))}
            {AddPlaceholder}
          </View>
        )}
      </View>
    </AtFloatLayout>
  )
}

export default AddRecipes
