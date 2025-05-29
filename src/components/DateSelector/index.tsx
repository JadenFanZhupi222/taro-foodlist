import { Picker, View, Text, Button } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react'
import {
  addDays,
  format,
  isSameDay,
  startOfDay
} from 'date-fns'
import './index.scss'

export interface DateSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

const MIN_DATE = new Date('2025-05-01')
const MAX_DATE = addDays(startOfDay(new Date()), 7)

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
  console.log('selectedDate', selectedDate)
  const [dateList, setDateList] = useState<Date[]>([])
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const hasAutoScrolled = useRef(false)

  useEffect(() => {
    // 生成前7天、今天、后7天共15天
    const today = startOfDay(new Date())
    const dates = Array.from({ length: 15 }, (_, i) => addDays(today, i - 7))
    setDateList(dates)
  }, [])

  useEffect(() => {
    // 只在初始渲染时自动滚动到选中日期
    if (!hasAutoScrolled.current && dateList.length > 0) {
      const idx = dateList.findIndex(date => isSameDay(date, selectedDate))
      if (idx !== -1 && itemRefs.current[idx]) {
        itemRefs.current[idx]?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' })
        hasAutoScrolled.current = true
      }
    }
  }, [selectedDate, dateList])

  return (
    <View className='date-selector' style={{ overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
      <View style={{ display: 'flex', flex: 1 }}>
        {dateList.map((date, idx) => {
          const dateStr = format(date, 'yyyy-MM-dd')
          const isSelected = isSameDay(selectedDate, date)
          return (
            <Button
              key={dateStr}
              className={`date-selector__item${isSelected ? ' active' : ''}`}
              onClick={() => onDateChange(date)}
              style={{ background: 'none', border: 'none', boxShadow: 'none', padding: 0 }}
            >
              <View className='date-selector__item-inner'>
                <Text className='date-selector__day'>{format(date, 'EE')}</Text>
                <Text className='date-selector__date'>{format(date, 'MM/dd')}</Text>
              </View>
            </Button>
          )
        })}
      </View>
      <Picker
        mode='date'
        value={format(selectedDate, 'yyyy-MM-dd')}
        start={format(MIN_DATE, 'yyyy-MM-dd')}
        end={format(MAX_DATE, 'yyyy-MM-dd')}
        onChange={e => onDateChange(new Date(e.detail.value))}
      >
        <View
          className='date-selector__picker-icon'
          style={{ width: 32, height: 32, marginLeft: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
        >
          <Text style={{ fontSize: 20 }}>📅</Text>
        </View>
      </Picker>
    </View>
  )
}

export default DateSelector 