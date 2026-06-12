import { Picker, View, Text } from '@tarojs/components'
import { format, isSameDay, startOfDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import './index.scss'

export interface DateSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

const MIN_DATE = new Date(new Date().setDate(new Date().getDate() - 30))
const MAX_DATE = new Date(new Date().setDate(new Date().getDate() + 7))

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
  const today = startOfDay(new Date())
  const isToday = isSameDay(selectedDate, today)

  return (
    <View className='date-selector-bar flat'>
      {isToday && <Text className='date-selector__today-tag'>今天</Text>}
      <Text className='date-selector__day'>{format(selectedDate, 'EEE', { locale: zhCN })}</Text>
      <Text className='date-selector__date'>{format(selectedDate, 'MM月dd日', { locale: zhCN })}</Text>
      <Picker
        mode='date'
        value={format(selectedDate, 'yyyy-MM-dd')}
        start={format(MIN_DATE, 'yyyy-MM-dd')}
        end={format(MAX_DATE, 'yyyy-MM-dd')}
        onChange={e => onDateChange(new Date(e.detail.value))}
      >
        <View className='date-selector__picker-icon'>📅</View>
      </Picker>
    </View>
  )
}

export default DateSelector 