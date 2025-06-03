interface RemoveRecipeFromMenuEvent {
  menuId: string;
  recipeId: string;
}

interface RemoveRecipeFromMenuResult {
  code: number;
  message: string;
  data?: {
    _id: string;
    family_id: string;
    date: string;
    recipes: { recipe_id: string; order: number }[];
    _openid: string;
    createdAt: string | number;
    updatedAt: string | number;
  };
} 