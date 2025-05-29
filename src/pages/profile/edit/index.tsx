import { useState } from 'react'
import { View, Image, Input, Button } from '@tarojs/components'
import { useSelector, useDispatch } from 'react-redux'
import { selectUser } from '@/store/user/selectors'
import { updateUserInfo } from '@/thunks/user/thunks'
import Taro from '@tarojs/taro'
import { RootState } from '@/store'
import type { AppDispatch } from '@/store'
import './index.scss'

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
      const uploadRes = await Taro.cloud.uploadFile({
        cloudPath: `avatar/${user?.openId}/${Date.now()}.jpg`,
        filePath: avatarUrl
      })
      setAvatarFileId(uploadRes.fileID)
      setAvatar(uploadRes.fileID)
      Taro.showToast({ title: '头像已选择', icon: 'success' })
    }
  }

  // 保存资料
  const handleSave = async () => {
    if (!user) return
    try {
      await dispatch(updateUserInfo({ avatar, avatarFileId, nickname, openId: user.openId })).unwrap()
      Taro.showToast({ title: '保存成功', icon: 'success' })
      Taro.navigateBack()
    } catch (e) {
      console.error(e)
      Taro.showToast({ title: '保存失败', icon: 'error' })
    }
  }

  return (
    <View className='profile-edit'>
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
        placeholder={user?.nickName ? `原昵称：${user.nickName}` : '请输入昵称'}
        value={nickname}
        onInput={e => setNickname(e.detail.value)}
        style={{ marginTop: 24 }}
        disabled={profileLoading}
      />
      <Button className='button-primary' onClick={handleSave} loading={profileLoading} disabled={profileLoading}>保存</Button>
    </View>
  )
}

export default ProfileEdit 