import './index.scss'
import { useEffect, useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { useDispatch, useSelector } from 'react-redux'
import { joinFamily, fetchFamilyById } from '@/thunks/family/thunks'
import Taro from '@tarojs/taro'
import Loading from '@/components/Loading'
import type { AppDispatch } from '@/store'
import { toast } from '@/utils/toast'
import MemberCardList from '@/components/family/memberCardList'
import { selectJoinLoading, selectInviteFamily, selectInviteFamilyLoading } from '@/store/family/selectors'

export default function AcceptInvite() {
  const dispatch = useDispatch<AppDispatch>()
  const [familyId, setFamilyId] = useState('')
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)
  const joinLoading = useSelector(selectJoinLoading)
  const inviteFamily = useSelector(selectInviteFamily)
  const inviteFamilyLoading = useSelector(selectInviteFamilyLoading)

  useEffect(() => {
    const router = Taro.getCurrentInstance().router
    const queryFamilyId = router?.params?.familyId
    if (queryFamilyId) {
      setFamilyId(queryFamilyId);
      dispatch(fetchFamilyById(queryFamilyId))
    }
  }, [dispatch])

  const handleAccept = async () => {
    if (!familyId) return
    setLoading(true)
    try {
      await dispatch(joinFamily(familyId)).unwrap()
      setJoined(true)
      setTimeout(() => {
        Taro.redirectTo({ url: '/pages/family/index' })
      }, 1200)
      toast({ title: '加入成功', icon: 'success' })
    } catch (e) {
      // 显示云函数返回的具体原因（如"你已加入其他家庭，请先退出当前家庭再加入"），icon:none 容纳长文案
      toast({ title: (e && e.message) || '加入失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='accept-invite'>
      <Loading visible={inviteFamilyLoading || loading || joinLoading} text={inviteFamilyLoading ? '加载家庭信息中...' : '正在加入...'} mask />
      <View className='family-header'>
        <Text className='family-title'>{inviteFamily?.name || '家庭'}</Text>
      </View>
      <View className='family-members'>
        <MemberCardList members={(inviteFamily?.membersInfo || []).map(m => ({
          ...m,
          role: m.openId === inviteFamily?.family_owner ? 'owner' : 'member',
        }))} />
      </View>
      <Button className='accept-btn' onClick={handleAccept} disabled={joined || !familyId}>
        {joined ? '已加入' : '接受邀请'}
      </Button>
    </View>
  )
} 