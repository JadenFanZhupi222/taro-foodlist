import { useState } from 'react'
import { View, Image, Input, Button } from '@tarojs/components'
import { useSelector, useDispatch } from 'react-redux'
import { selectUser } from '@/store/user/selectors'
import { updateUserInfo } from '@/thunks/user/thunks'
import Taro from '@tarojs/taro'
import { RootState } from '@/store'
import type { AppDispatch } from '@/store'
import './index.scss'
import { useAvatarUpload } from '@/hooks/useAvatarUpload'
import Loading from '@/components/Loading'
import { toast } from '@/utils/toast'

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

const ProfileEdit = () => {
  const user = useSelector(selectUser)
  const profileLoading = useSelector((state: RootState) => state.user.profileLoading)
  const dispatch = useDispatch<AppDispatch>()
  const [nickname, setNickname] = useState(user?.nickname || '')
  const [avatar, setAvatar] = useState(user?.avatar || defaultAvatarUrl)
  const [avatarFileId, setAvatarFileId] = useState('')

  // 选择微信头像
  const handleChooseAvatar = async (e: { detail: { avatarUrl: string } }) => {
    const { avatarUrl } = e.detail
    if (avatarUrl) {
      setAvatar(avatarUrl)
      const fileID = await useAvatarUpload(avatarUrl, user!.openId)
      setAvatarFileId(fileID)
      toast({ title: '头像已选择', icon: 'success' })
    }
  }

  // 保存资料
  const handleSave = async () => {
    if (!user) return
    let fileID = avatarFileId
    if (!avatarFileId) {
      fileID = await useAvatarUpload(avatar, user!.openId)
      setAvatarFileId(fileID)
    }
    try {
      await dispatch(updateUserInfo({ avatar, avatarFileId: fileID, nickname, openId: user.openId })).unwrap()
      toast({ title: '保存成功', icon: 'success' })
      Taro.navigateBack()
    } catch (e) {
      console.error(e)
      toast({ title: '保存失败', icon: 'error' })
    }
  }

  return (
    <View className='profile-edit'>
      <Loading visible={profileLoading} text='保存中...' mask />
      <View className='avatar-edit'>
        <Button
          className='avatar-wrapper'
          openType='chooseAvatar'
          onChooseAvatar={handleChooseAvatar}
          loading={profileLoading}
          disabled={profileLoading}
        >
          <Image className='avatar' src={avatar || defaultAvatarUrl} />
        </Button>
      </View>
      <Input
        className='nickname-input'
        type='nickname'
        placeholder={user?.nickname ? `原昵称：${user.nickname}` : '请输入昵称'}
        value={nickname}
        onInput={e => setNickname(e.detail.value)}
        style={{ marginTop: 24 }}
        disabled={profileLoading}
      />
      <Button className='button-primary' onClick={handleSave} disabled={profileLoading}>保存</Button>
    </View>
  )
}

export default ProfileEdit 