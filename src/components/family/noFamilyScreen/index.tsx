import { useState } from 'react'
import { View, Text, Input, Button, Form } from '@tarojs/components'
import Loading from '@/components/Loading'
import './index.scss'
import { toast } from '@/utils/toast'

interface NoFamilyScreenProps {
  onCreate: (familyName: string) => Promise<void>
  loading: boolean
}

export default function NoFamilyScreen({ onCreate, loading }: NoFamilyScreenProps) {
  const [showCreate, setShowCreate] = useState(false)

  const handleSubmit = async (e) => {
    const value = e.detail.value.familyName
    if (!value || !value.trim()) {
      toast({ title: '请输入家庭名称', icon: 'none' })
      return
    }
    await onCreate(value)
    setShowCreate(false)
  }

  return (
    <View className='family-empty'>
      <Text>你还没有加入家庭，快去创建一个吧！</Text>
      {showCreate ? (
        <View className='create-family-box'>
          <Form onSubmit={handleSubmit}>
            <Input
              name="familyName"
              placeholder='输入家庭名称'
              maxlength={12}
            />
            <View className='button-row'>
              <Button
                formType="submit"
                loading={loading}
                type='primary'
                size='mini'
              >创建</Button>
              <Button onClick={() => setShowCreate(false)} size='mini'>取消</Button>
            </View>
          </Form>
          <Loading visible={loading} text='创建中...' mask={false} />
        </View>
      ) : (
        <Button onClick={() => setShowCreate(true)} type='primary'>创建家庭</Button>
      )}
    </View>
  )
} 