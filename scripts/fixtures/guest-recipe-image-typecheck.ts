import { getVisibleRecipes } from '../../src/data/guestRecipes'

const visibleRecipes = getVisibleRecipes([
  {
    _id: 'recipe:family-1',
    name: '家常菜',
    type: '大荤',
    image: 'cloud://family/recipe.jpg'
  }
], true)

const image: string | undefined = visibleRecipes[0].image
void image
