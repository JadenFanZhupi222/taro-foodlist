import { View, Text, Image } from '@tarojs/components'
import { useEffect, useState } from 'react'
import { DEFAULT_AVATAR_URL } from '@/constants/avatar'
import './index.scss'

interface MemberCardProps {
  avatar: string
  name: string
  role: 'owner' | 'member'
  isMe?: boolean
}

export default function MemberCard({ avatar, name, role, isMe }: MemberCardProps) {
  const fallbackAvatar = avatar?.trim() || DEFAULT_AVATAR_URL
  const [avatarSrc, setAvatarSrc] = useState(fallbackAvatar)

  useEffect(() => setAvatarSrc(fallbackAvatar), [fallbackAvatar])

  return (
    <View className={`member-row${isMe ? ' me' : ''}`}>
      <Image className='member-avatar' src={avatarSrc} onError={() => setAvatarSrc(DEFAULT_AVATAR_URL)} />
      <Text className='member-name'>{name}</Text>
      <Text className={`member-role ${role}`}>{role === 'owner' ? '家庭管理员' : '成员'}</Text>
    </View>
  )
}
