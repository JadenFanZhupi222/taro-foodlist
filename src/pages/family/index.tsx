import { useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { useSelector, useDispatch } from 'react-redux'
import { fetchFamily, createFamily } from '@/thunks/family/thunks'
import Taro, { useShareAppMessage } from '@tarojs/taro'
import './index.scss'
import type { AppDispatch } from '@/store'
import Loading from '@/components/Loading'
import MemberCardList from '@/components/family/memberCardList'
import NoFamilyScreen from '@/components/family/noFamilyScreen'
import ShareInvitationBtn from '@/components/family/shareInvitationBtn'
import { selectCurrentFamily, selectFamilyLoading, selectCreateFamilyLoading } from '@/store/family/selectors'
import { selectUser } from '@/store/user/selectors'

export default function Family() {
  const dispatch = useDispatch<AppDispatch>()
  const family = useSelector(selectCurrentFamily)
  const fetchLoading = useSelector(selectFamilyLoading)
  const createLoading = useSelector(selectCreateFamilyLoading)
  const user = useSelector(selectUser)

  useEffect(() => {
    dispatch(fetchFamily())
    // 启用微信分享
    Taro.showShareMenu({ withShareTicket: true })
  }, [dispatch])

  useShareAppMessage(() => {
    if (family) {
      return {
        title: `邀请你加入家庭【${family.name}】`,
        path: `/pages/family/acceptInvite/index?familyId=${family._id}`
      }
    }
    return {
      title: '家庭空间',
      path: '/pages/family/index'
    }
  })

  // 创建家庭
  const handleCreate = async (familyName: string) => {
    await dispatch(createFamily(familyName)).unwrap()
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
          <ShareInvitationBtn />
        </>
      ) : (
        <NoFamilyScreen onCreate={handleCreate} loading={createLoading} />
      )}
    </View>
  )
}