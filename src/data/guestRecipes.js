/**
 * @typedef {{ name: string, amount: string }} GuestIngredient
 * @typedef {{
 *   _id: string,
 *   name: string,
 *   type: string,
 *   image?: string,
 *   description: string,
 *   ingredients: GuestIngredient[],
 *   steps: string[],
 *   deleted: false
 * }} GuestRecipe
 */

/** @type {GuestRecipe[]} */
const guestRecipes = [
  {
    _id: 'guest:tomato-scrambled-eggs',
    name: '番茄炒蛋',
    type: '小荤',
    description: '酸甜柔嫩的经典家常菜，番茄炒出汤汁后裹住松软鸡蛋，简单却很下饭。',
    ingredients: [
      { name: '番茄', amount: '2 个' },
      { name: '鸡蛋', amount: '3 个' },
      { name: '小葱', amount: '1 根' },
      { name: '盐', amount: '适量' },
      { name: '白糖', amount: '1 茶匙' }
    ],
    steps: [
      '番茄切块，小葱切花；鸡蛋加少许盐充分打散。',
      '锅中放油烧热，倒入蛋液快速推炒至刚凝固，盛出备用。',
      '原锅下番茄翻炒，加入白糖和盐，炒至番茄变软出汁。',
      '倒回鸡蛋轻轻翻匀，撒上葱花即可装盘。'
    ],
    deleted: false
  },
  {
    _id: 'guest:lotus-root-pork-rib-soup',
    name: '莲藕排骨汤',
    type: '汤类',
    description: '清甜温润的一锅慢炖汤，莲藕粉糯、排骨鲜香，适合全家围桌分享。',
    ingredients: [
      { name: '猪肋排', amount: '500 克' },
      { name: '莲藕', amount: '1 节' },
      { name: '生姜', amount: '3 片' },
      { name: '小葱', amount: '2 根' },
      { name: '盐', amount: '适量' }
    ],
    steps: [
      '排骨冷水下锅焯去浮沫，捞出后用温水洗净。',
      '莲藕去皮切滚刀块，与排骨、姜片一同放入汤锅。',
      '加入足量热水，大火煮沸后转小火炖约 70 分钟。',
      '待莲藕粉糯、汤色清亮时加盐调味，撒葱花即可。'
    ],
    deleted: false
  }
]

/**
 * @template T
 * @param {T[]} realRecipes
 * @param {boolean} isLoggedIn
 * @returns {Array<T | GuestRecipe>}
 */
function getVisibleRecipes(realRecipes, isLoggedIn) {
  return isLoggedIn ? realRecipes : guestRecipes
}

/**
 * @template {{ _id: string }} T
 * @param {T[]} realRecipes
 * @param {string} recipeId
 * @param {boolean} isLoggedIn
 * @returns {T | GuestRecipe | undefined}
 */
function findVisibleRecipe(realRecipes, recipeId, isLoggedIn) {
  return getVisibleRecipes(realRecipes, isLoggedIn).find(recipe => recipe._id === recipeId)
}

/** @param {string} recipeId */
function isGuestRecipeId(recipeId) {
  return recipeId.startsWith('guest:')
}

export {
  guestRecipes,
  getVisibleRecipes,
  findVisibleRecipe,
  isGuestRecipeId
}
