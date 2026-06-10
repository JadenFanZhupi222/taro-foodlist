import { View, Input, Textarea, Button, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useRouter } from '@tarojs/taro'
import { FC, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectUser } from '@/store/user/selectors'
import { selectRecipes, selectRecipeLoading } from '@/store/recipe/selectors'
import { selectCurrentFamily } from '@/store/family/selectors'
import { createRecipe, updateRecipeById } from '@/thunks/recipe/thunks'
import './index.scss'
import { toast } from '@/utils/toast'
import { User as GlobalUser } from '@/types/store'
import { AppDispatch } from '@/store'
import { RecipeCategory, RECIPE_CATEGORIES } from '@/store/recipe/types'
import { updateRecipeInStore } from '@/store/recipe/recipeSlice'
import { useCloudUpload } from '@/hooks/useCloudImageUpload'
import Loading from '@/components/Loading'

// 用于生成唯一id，兼容小程序
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6)
}

const RecipeEdit: FC = () => {
  const router = useRouter()
  const { id } = router.params
  const user = useSelector(selectUser) as GlobalUser | null
  const recipes = useSelector(selectRecipes)
  const currentFamily = useSelector(selectCurrentFamily)
  const { createLoading, updateLoading } = useSelector(selectRecipeLoading)
  const dispatch = useDispatch<AppDispatch>()

  const editingRecipe = id ? recipes.find(r => r._id === id) : null

  const [name, setName] = useState(editingRecipe?.name || '')
  const [type, setType] = useState<RecipeCategory>(editingRecipe?.type || '大荤')
  const [imageLocal, setImageLocal] = useState(editingRecipe?.image || '')
  const [description, setDescription] = useState(editingRecipe?.description || '')
  const [ingredients, setIngredients] = useState(
    editingRecipe?.ingredients?.map(i => ({ ...i, id: genId() })) || [{ id: genId(), name: '', amount: '' }]
  )
  const [steps, setSteps] = useState(
    editingRecipe?.steps?.map(s => ({ id: genId(), text: s })) || [{ id: genId(), text: '' }]
  )
  const [deletingIngredientIds, setDeletingIngredientIds] = useState<string[]>([])
  const [deletingStepIds, setDeletingStepIds] = useState<string[]>([])

  const handleChooseImage = async () => {
    const res = await Taro.chooseImage({ count: 1, sizeType: ['compressed'] })
    if (res.tempFilePaths && res.tempFilePaths[0]) {
      setImageLocal(res.tempFilePaths[0])
    }
  }

  const handleSave = async () => {
    if (!user) {
      toast({ title: '请先登录', icon: 'none' })
      return
    }
    // 家庭归属以服务端加载的当前家庭为准，回退到本地缓存
    const familyId = currentFamily?._id || user.family_id
    if (!familyId) {
      toast({ title: '请先加入家庭', icon: 'none' })
      return
    }
    if (!name.trim()) {
      toast({ title: '请输入菜名', icon: 'none' })
      return
    }
    if (!type) {
      toast({ title: '请选择分类', icon: 'none' })
      return
    }
    let imageUrl = imageLocal
    if (imageLocal) {
      imageUrl = await useCloudUpload(imageLocal, 'recipes', user._id)
    }
    const recipe = {
      name: name.trim(),
      type: type,
      image: imageUrl.trim(),
      description: description.trim(),
      steps: steps.map(s => s.text.trim()).filter(Boolean),
      ingredients: ingredients.filter(i => i.name.trim()).map(({ name, amount }) => ({ name, amount })),
      createdBy: user._id,
      deleted: false
    }
    if (editingRecipe) {
      dispatch(updateRecipeInStore({ recipeId: editingRecipe._id, recipe }))
      await dispatch(updateRecipeById({ recipeId: editingRecipe._id, recipe }))
    } else {
      await dispatch(createRecipe({ familyId, recipe }))
    }
    toast({ title: '保存成功', icon: 'success' })
    Taro.navigateBack()
  }

  // 食材操作
  const handleAddIngredient = () => setIngredients([...ingredients, { id: genId(), name: '', amount: '' }])
  const handleRemoveIngredient = (id: string) => {
    setDeletingIngredientIds(ids => [...ids, id])
    setTimeout(() => {
      setIngredients(ings => ings.filter(i => i.id !== id))
      setDeletingIngredientIds(ids => ids.filter(did => did !== id))
    }, 300)
  }
  const handleIngredientChange = (id: string, field: 'name' | 'amount', value: string) => {
    setIngredients(ingredients.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  // 步骤操作
  const handleAddStep = () => setSteps([...steps, { id: genId(), text: '' }])
  const handleRemoveStep = (id: string) => {
    setDeletingStepIds(ids => [...ids, id])
    setTimeout(() => {
      setSteps(steps => steps.filter(s => s.id !== id))
      setDeletingStepIds(ids => ids.filter(did => did !== id))
    }, 300)
  }
  const handleStepChange = (id: string, value: string) => setSteps(steps.map(s => s.id === id ? { ...s, text: value } : s))

  // 内部渲染函数
  function renderIngredientRow(item: typeof ingredients[0]) {
    return (
      <View className={`form-ingredient-row${deletingIngredientIds.includes(item.id) ? ' fade-out' : ' fade-in'}`} key={item.id}>
        <Input className='form-input' value={item.name} onInput={e => handleIngredientChange(item.id, 'name', e.detail.value)} placeholder='食材名称' />
        <Input className='form-input' value={item.amount} onInput={e => handleIngredientChange(item.id, 'amount', e.detail.value)} placeholder='用量' />
        <Button className='form-remove-btn' onClick={() => handleRemoveIngredient(item.id)}>删除</Button>
      </View>
    )
  }

  function renderStepRow(step: typeof steps[0], idx: number) {
    return (
      <View className={`form-step-row${deletingStepIds.includes(step.id) ? ' fade-out' : ' fade-in'}`} key={step.id}>
        <Text className='form-step-number'>{idx + 1}</Text>
        <Textarea 
          className='form-textarea' 
          value={step.text} 
          onInput={e => handleStepChange(step.id, e.detail.value)} 
          placeholder='请输入步骤'
          adjustPosition
        />
        <Button className='form-remove-btn' onClick={() => handleRemoveStep(step.id)}>删除</Button>
      </View>
    )
  }

  function renderImageSection() {
    return (
      <View className='form-section'>
        <Text className='form-label'>图片</Text>
        {imageLocal ? (
          <View style={{ marginBottom: '2vh' }}>
            <Image src={imageLocal} style={{ width: '30vw', height: '30vw', borderRadius: '2vw', objectFit: 'cover' }} />
          </View>
        ) : null}
        <Button className='form-add-btn' onClick={handleChooseImage}>
          {imageLocal ? '更换图片' : '上传图片'}
        </Button>
      </View>
    )
  }

  return (
    <View className='recipe-edit-page'>
      <Loading visible={createLoading || updateLoading} />
      <ScrollView 
        className='recipe-edit-scroll' 
        scrollY 
        scrollWithAnimation
        enhanced
        showScrollbar={false}
      >
        <View className='form-card'>
          <Text className='form-title'>家庭食谱</Text>
          <View className='form-section'>
            <Text className='form-label'>菜名</Text>
            <Input className='form-input' value={name} onInput={e => setName(e.detail.value)} placeholder='请输入菜名' />
          </View>
          <View className='form-section'>
            <Text className='form-label'>分类</Text>
            <View className='form-categories'>
              {RECIPE_CATEGORIES.map(category => (
                <View
                  key={category}
                  className={`form-category ${type === category ? 'active' : ''}`}
                  onClick={() => setType(category)}
                >
                  {category}
                </View>
              ))}
            </View>
          </View>
          {renderImageSection()}
          <View className='form-section'>
            <Text className='form-label'>描述</Text>
            <Textarea 
              className='form-textarea' 
              value={description} 
              onInput={e => setDescription(e.detail.value)} 
              placeholder='请输入描述'
              adjustPosition
            />
          </View>
          <View className='form-section'>
            <Text className='form-label'>食材</Text>
            {ingredients.map(renderIngredientRow)}
            <Button className='form-add-btn' onClick={handleAddIngredient}>添加食材</Button>
          </View>
          <View className='form-section'>
            <Text className='form-label'>步骤</Text>
            {steps.map(renderStepRow)}
            <Button className='form-add-btn' onClick={handleAddStep}>添加步骤</Button>
          </View>
          <View className='form-actions'>
            <Button className='form-save-btn' onClick={handleSave} disabled={createLoading || updateLoading}>保存</Button>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default RecipeEdit 