export interface Recipe {
  id: string
  name: string
  type: string
  image: string
  description: string
  steps: string[]
  ingredients: {
    name: string
    amount: string
  }[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
} 