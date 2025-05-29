import { View, Text } from '@tarojs/components'
import { FC } from 'react'
import './index.scss'

interface CategoryNavProps {
  categories: string[]
  activeCategory: string
  onSelect: (category: string) => void
}

const CategoryNav: FC<CategoryNavProps> = ({ categories, activeCategory, onSelect }) => {
  return (
    <View className='category-nav'>
      {categories.map(category => (
        <View
          key={category}
          className={`category-nav__item ${category === activeCategory ? 'active' : ''}`}
          onClick={() => onSelect(category)}
        >
          <Text className='category-nav__text'>{category}</Text>
        </View>
      ))}
    </View>
  )
}

export default CategoryNav 