import { Input, View } from '@tarojs/components'
import { FC } from 'react'
import './index.scss'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const SearchBar: FC<SearchBarProps> = ({ value, onChange, placeholder = '搜索食谱', className = '' }) => {
  return (
    <View className={`search-bar ${className}`}>
      <Input
        className='search-input'
        type='text'
        placeholder={placeholder}
        value={value}
        onInput={e => onChange(e.detail.value)}
      />
    </View>
  )
}

export default SearchBar 