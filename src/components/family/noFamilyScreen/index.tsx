import { useState } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import Loading from '@/components/Loading'
import './index.scss'

interface NoFamilyScreenProps {
  onCreate: (familyName: string) => Promise<void>
  loading: boolean
}

export default function NoFamilyScreen({ onCreate, loading }: NoFamilyScreenProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [familyName, setFamilyName] = useState('')

  const handleCreate = async () => {
    if (!familyName.trim()) {
      // 这里建议用Taro.showToast，实际项目可传toast方法进来
      Taro.showToast({ title: '请输入家庭名称', icon: 'none' })
      return
    }
    await onCreate(familyName)
    setShowCreate(false)
    setFamilyName('')
  }

  return (
    <View className='family-empty'>
      <Text>你还没有加入家庭，快去创建一个吧！</Text>
      {showCreate ? (
        <View className='create-family-box'>
          <Input
            value={familyName}
            onInput={e => setFamilyName(e.detail.value)}
            placeholder='输入家庭名称'
            maxlength={12}
          />
          <View className='button-row'>
            <Button
              onClick={handleCreate}
              loading={loading}
              type='primary'
              size='mini'
            >创建</Button>
            <Button onClick={() => setShowCreate(false)} size='mini'>取消</Button>
          </View>
          <Loading visible={loading} text='创建中...' mask={false} />
        </View>
      ) : (
        <Button onClick={() => setShowCreate(true)} type='primary'>创建家庭</Button>
      )}
    </View>
  )
} 