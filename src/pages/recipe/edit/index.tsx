import { View, Input, Textarea, Button, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useRouter } from '@tarojs/taro'
import { FC, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectUser } from '@/store/user/selectors'
import { selectRecipes } from '@/store/recipe/selectors'
import { addRecipe, updateRecipe } from '@/store/recipe/actions'
import './index.scss'

const CATEGORIES = ['大荤', '小荤', '炒菜', '汤类', '其他']

interface RecipeForm {
  name: string
  type: string
  image: string
  description: string
  steps: string[]
  ingredients: { name: string; amount: string }[]
}

const RecipeEdit: FC = () => {
  const router = useRouter()
  const { id } = router.params
  const user = useSelector(selectUser)
  const recipes = useSelector(selectRecipes)
  const dispatch = useDispatch()

  const editingRecipe = id ? recipes.find(r => r.id === id) : null

  const [name, setName] = useState(editingRecipe?.name || '')
  const [type, setType] = useState(editingRecipe?.type || '')
  const [image, setImage] = useState(editingRecipe?.image || '')
  const [description, setDescription] = useState(editingRecipe?.description || '')
  const [steps, setSteps] = useState(editingRecipe?.steps.join('\n') || '')
  const [ingredients, setIngredients] = useState(
    editingRecipe?.ingredients.map(i => `${i.name}:${i.amount}`).join('\n') || ''
  )

  const handleSave = () => {
    if (!user) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    const recipe = {
      id: editingRecipe?.id || Date.now().toString(),
      name,
      type,
      image,
      description,
      steps: steps.split('\n').map(s => s.trim()).filter(Boolean),
      ingredients: ingredients.split('\n').map(line => {
        const [name, amount] = line.split(':')
        return { name: name?.trim() || '', amount: amount?.trim() || '' }
      }).filter(i => i.name),
      createdBy: user._id,
      createdAt: editingRecipe?.createdAt || new Date(),
      updatedAt: new Date()
    }
    if (editingRecipe) {
      dispatch(updateRecipe(recipe))
    } else {
      dispatch(addRecipe(recipe))
    }
    Taro.showToast({ title: '保存成功', icon: 'success' })
    Taro.navigateBack()
  }

  const handleAddStep = () => {
    setSteps(prev => prev ? prev + '\n' : '')
  }

  const handleRemoveStep = (index: number) => {
    const arr = steps.split('\n')
    arr.splice(index, 1)
    setSteps(arr.join('\n'))
  }

  const handleStepChange = (index: number, value: string) => {
    const arr = steps.split('\n')
    arr[index] = value
    setSteps(arr.join('\n'))
  }

  const handleAddIngredient = () => {
    setIngredients(prev => prev ? prev + '\n' : '')
  }

  const handleRemoveIngredient = (index: number) => {
    const arr = ingredients.split('\n')
    arr.splice(index, 1)
    setIngredients(arr.join('\n'))
  }

  const handleIngredientChange = (index: number, field: 'name' | 'amount', value: string) => {
    const arr = ingredients.split('\n')
    const [name, amount] = arr[index]?.split(':') || ['', '']
    arr[index] = field === 'name' ? `${value}:${amount || ''}` : `${name || ''}:${value}`
    setIngredients(arr.join('\n'))
  }

  return (
    <View className='recipe-edit'>
      <View className='recipe-edit__form'>
        <View className='recipe-edit__field'>
          <Text className='recipe-edit__label'>菜名</Text>
          <Input
            className='recipe-edit__input'
            value={name}
            onInput={e => setName(e.detail.value)}
            placeholder='请输入菜名'
          />
        </View>

        <View className='recipe-edit__field'>
          <Text className='recipe-edit__label'>分类</Text>
          <View className='recipe-edit__categories'>
            {CATEGORIES.map(category => (
              <View
                key={category}
                className={`recipe-edit__category ${type === category ? 'active' : ''}`}
                onClick={() => setType(category)}
              >
                {category}
              </View>
            ))}
          </View>
        </View>

        <View className='recipe-edit__field'>
          <Text className='recipe-edit__label'>图片</Text>
          <Input
            className='recipe-edit__input'
            value={image}
            onInput={e => setImage(e.detail.value)}
            placeholder='请输入图片URL'
          />
        </View>

        <View className='recipe-edit__field'>
          <Text className='recipe-edit__label'>描述</Text>
          <Textarea
            className='recipe-edit__textarea'
            value={description}
            onInput={e => setDescription(e.detail.value)}
            placeholder='请输入描述'
          />
        </View>

        <View className='recipe-edit__field'>
          <Text className='recipe-edit__label'>食材</Text>
          <View className='recipe-edit__ingredients'>
            {ingredients.split('\n').map((line, index) => {
              const [name, amount] = line.split(':')
              return (
                <View key={index} className='recipe-edit__ingredient'>
                  <Input
                    className='recipe-edit__input'
                    value={name}
                    onInput={e => handleIngredientChange(index, 'name', e.detail.value)}
                    placeholder='食材名称'
                  />
                  <Input
                    className='recipe-edit__input'
                    value={amount}
                    onInput={e => handleIngredientChange(index, 'amount', e.detail.value)}
                    placeholder='用量'
                  />
                  <Button
                    className='recipe-edit__remove-btn'
                    onClick={() => handleRemoveIngredient(index)}
                  >
                    删除
                  </Button>
                </View>
              )
            })}
            <Button
              className='recipe-edit__add-btn'
              onClick={handleAddIngredient}
            >
              添加食材
            </Button>
          </View>
        </View>

        <View className='recipe-edit__field'>
          <Text className='recipe-edit__label'>步骤</Text>
          <View className='recipe-edit__steps'>
            {steps.split('\n').map((step, index) => (
              <View key={index} className='recipe-edit__step'>
                <Text className='recipe-edit__step-number'>{index + 1}</Text>
                <Textarea
                  className='recipe-edit__textarea'
                  value={step}
                  onInput={e => handleStepChange(index, e.detail.value)}
                  placeholder='请输入步骤'
                />
                <Button
                  className='recipe-edit__remove-btn'
                  onClick={() => handleRemoveStep(index)}
                >
                  删除
                </Button>
              </View>
            ))}
            <Button
              className='recipe-edit__add-btn'
              onClick={handleAddStep}
            >
              添加步骤
            </Button>
          </View>
        </View>
      </View>

      <Button className='recipe-edit__save-btn' onClick={handleSave}>
        保存
      </Button>
    </View>
  )
}

export default RecipeEdit 