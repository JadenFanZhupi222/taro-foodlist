import { Picker, View, Text } from '@tarojs/components'
import { toDateKey } from '@/utils/date'
import './index.scss'

export interface DateSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

const addDays = (base: Date, days: number) => {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

const MIN_DATE = addDays(new Date(), -30)
const MAX_DATE = addDays(new Date(), 7)
const WEEKDAYS_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
  const isToday = toDateKey(selectedDate) === toDateKey(new Date())
  // 'yyyy-MM-dd' -> 'MM月dd日'
  const key = toDateKey(selectedDate)
  const mmdd = `${key.slice(5, 7)}月${key.slice(8, 10)}日`

  return (
    <View className='date-selector-bar flat'>
      {isToday && <Text className='date-selector__today-tag'>今天</Text>}
      <Text className='date-selector__day'>{WEEKDAYS_ZH[selectedDate.getDay()]}</Text>
      <Text className='date-selector__date'>{mmdd}</Text>
      <Picker
        mode='date'
        value={toDateKey(selectedDate)}
        start={toDateKey(MIN_DATE)}
        end={toDateKey(MAX_DATE)}
        onChange={e => onDateChange(new Date(e.detail.value + 'T00:00:00'))}
      >
        <View className='date-selector__picker-icon'>📅</View>
      </Picker>
    </View>
  )
}

export default DateSelector
