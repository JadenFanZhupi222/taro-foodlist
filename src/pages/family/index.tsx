import { useEffect, useState } from 'react'
import { View, Text, Button, Input, Image } from '@tarojs/components'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import { fetchFamily, createFamily, joinFamily } from '@/thunks/family/thunks'
import Taro from '@tarojs/taro'
import './index.scss'
import type { AppDispatch } from '@/store'
import Loading from '@/components/Loading'

export default function Family() {
  const dispatch = useDispatch<AppDispatch>()
  const family = useSelector((state: RootState) => state.family.currentFamily)
  const fetchLoading = useSelector((state: RootState) => state.family.fetchLoading)
  const createLoading = useSelector((state: RootState) => state.family.createLoading)
  const user = useSelector((state: RootState) => state.user.current)
  const [showCreate, setShowCreate] = useState(false)
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
    setShowCreate(false)
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
            <Text className='family-owner'>家庭ID: {family.id}</Text>
          </View>
          <View className='family-members'>
            <Text className='section-title'>成员列表</Text>
            {family.membersInfo && family.membersInfo.length > 0 ? (
              family.membersInfo.map((m) => (
                <View className='member-item' key={m.openId}>
                  {/* 头像可扩展 */}
                  {m.avatar && <Image className='member-avatar' src={m.avatar} />}
                  <Text className='member-name'>{m.openId === user?.openId ? '我' : m.nickname || m.openId}</Text>
                  <Text className='member-role'>{m.role === 'owner' ? '家庭管理员' : '成员'}</Text>
                </View>
              ))
            ) : (
              <Text>暂无成员</Text>
            )}
          </View>
          <View className='family-actions'>
            <Button onClick={handleInvite} type='primary'>邀请成员</Button>
            {/* <Button onClick={handleLeave} type='warn'>退出家庭</Button> */}
          </View>
        </>
      ) : (
        <View className='family-empty'>
          <Text>你还没有家庭，快去创建一个吧！</Text>
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
                  loading={createLoading}
                  type='primary'
                  size='mini'
                >创建</Button>
                <Button onClick={() => setShowCreate(false)} size='mini'>取消</Button>
              </View>
              <Loading visible={createLoading} text='创建中...' mask={false} />
            </View>
          ) : (
            <Button onClick={() => setShowCreate(true)} type='primary'>创建家庭</Button>
          )}
        </View>
      )}
    </View>
  )
} 