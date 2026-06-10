import { useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { useSelector, useDispatch } from 'react-redux'
import { fetchFamily, createFamily, leaveFamily } from '@/thunks/family/thunks'
import Taro, { useShareAppMessage } from '@tarojs/taro'
import './index.scss'
import type { AppDispatch } from '@/store'
import Loading from '@/components/Loading'
import MemberCardList from '@/components/family/memberCardList'
import NoFamilyScreen from '@/components/family/noFamilyScreen'
import ShareInvitationBtn from '@/components/family/shareInvitationBtn'
import { selectCurrentFamily, selectFamilyLoading, selectCreateFamilyLoading } from '@/store/family/selectors'
import { selectUser } from '@/store/user/selectors'
import { toast } from '@/utils/toast'

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

  // 退出家庭
  const handleLeave = async () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出当前家庭吗？',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          try {
            await dispatch(leaveFamily()).unwrap()
            toast({ title: '已退出家庭', icon: 'success' })
          } catch (e) {
            toast({ title: '退出失败', icon: 'error' })
          }
        }
      }
    })
  }

  return (
    <View className='family'>
      <Loading visible={fetchLoading} text='加载家庭信息中...' mask />
      {family ? (
        <>
          <View className='family-header'>
            <Text className='family-title'>{family.name}</Text>
          </View>
          <View className='family-members'>
            <MemberCardList members={
              (family.membersInfo || [])
                .slice() // 防止原数组被改动
                .sort((a, b) => {
                  // 按照 family.members 的顺序排序
                  const idxA = (family.members || []).indexOf(a.openId)
                  const idxB = (family.members || []).indexOf(b.openId)
                  return idxA - idxB
                })
                .map(m => ({
                  ...m,
                  role: m.openId === family.family_owner ? 'owner' : 'member',
                }))
            } currentUserId={user?.openId} />
          </View>
          <ShareInvitationBtn />
          <View className='family-leave-btn-wrap'>
            <View
              className='family-leave-btn'
              onClick={handleLeave}
            >
              退出家庭
            </View>
          </View>
        </>
      ) : (
        <NoFamilyScreen onCreate={handleCreate} loading={createLoading} />
      )}
    </View>
  )
}