import { View, Text } from '@tarojs/components'
import PageHeader from '@/components/PageHeader'
import './index.scss'

export interface SettingPageItem {
  title: string
  description: string
  value?: string
}

interface SettingPageProps {
  eyebrow: string
  title: string
  description: string
  symbol: string
  items: SettingPageItem[]
  note: string
}

export default function SettingPage({ eyebrow, title, description, symbol, items, note }: SettingPageProps) {
  return (
    <View className='setting-page'>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <View className='setting-page__hero'>
        <Text className='setting-page__symbol'>{symbol}</Text>
        <Text className='setting-page__hero-copy'>让家里的每一次记录，都清楚又安心。</Text>
      </View>
      <View className='setting-page__group'>
        {items.map(item => (
          <View className='setting-page__item' key={item.title}>
            <View className='setting-page__item-copy'>
              <Text className='setting-page__item-title'>{item.title}</Text>
              <Text className='setting-page__item-description'>{item.description}</Text>
            </View>
            {item.value && <Text className='setting-page__value'>{item.value}</Text>}
          </View>
        ))}
      </View>
      <Text className='setting-page__note'>{note}</Text>
    </View>
  )
}
