import { useEffect, useState } from 'react'
import { View, Text } from '@tarojs/components'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { fetchFamily, createFamily, joinFamily } from '@/thunks/family/thunks'
import Taro from '@tarojs/taro'
import './index.scss'
import type { AppDispatch } from '@/store'
import Loading from '@/components/Loading'
import MemberCardList from '@/components/family/memberCardList'
import NoFamilyScreen from '@/components/family/noFamilyScreen'

export default function Family() {
  const dispatch = useDispatch<AppDispatch>()
  const family = useSelector((state: RootState) => state.family.currentFamily)
  const fetchLoading = useSelector((state: RootState) => state.family.fetchLoading)
  const createLoading = useSelector((state: RootState) => state.family.createLoading)
  const user = useSelector((state: RootState) => state.user.current)
  const [familyName, setFamilyName] = useState('')

  useEffect(() => {
    dispatch(fetchFamily())
    // 启用微信分享
    Taro.showShareMenu({ withShareTicket: true })
  }, [dispatch])

  // 创建家庭
  const handleCreate = async () => {
    console.log('familyName', familyName)
    if (!familyName.trim()) {
      Taro.showToast({ title: '请输入家庭名称', icon: 'none' })
      return
    }
    await dispatch(createFamily(familyName)).unwrap()
    setFamilyName('')
  }

  // 邀请成员（微信原生分享）
  const handleInvite = () => {
    Taro.showToast({ title: '请点击右上角"···"分享小程序邀请成员', icon: 'none' })
  }

  // 退出家庭（如有云函数可补充）
  // const handleLeave = () => {}

  return (
    <View className='family'>
      <Loading visible={fetchLoading} text='加载家庭信息中...' mask />
      {family ? (
        <>
          <View className='family-header'>
            <Text className='family-title'>{family.name}</Text>
          </View>
          <View className='family-members'>
            <MemberCardList members={(family.membersInfo || []).map(m => ({
              ...m,
              role: m.role === 'owner' ? 'owner' : 'member',
            }))} currentUserId={user?.openId} />
          </View>
        </>
      ) : (
        <NoFamilyScreen onCreate={handleCreate} loading={createLoading} />
      )}
    </View>
  )
}