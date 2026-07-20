import { View, Image, Text } from '@tarojs/components'
import { useEffect, useState } from 'react'
import { DEFAULT_AVATAR_URL } from '@/constants/avatar'
import './index.scss'

interface UserCardProps {
  avatar: string
  nickname: string
  subtitle?: string
  onEdit?: () => void
  children?: React.ReactNode
  user?: any
  className?: string
}

const UserCard = ({ avatar, nickname, subtitle, onEdit, children, user, className = '' }: UserCardProps) => {
  const [avatarSrc, setAvatarSrc] = useState(avatar?.trim() || DEFAULT_AVATAR_URL)

  useEffect(() => {
    setAvatarSrc(avatar?.trim() || DEFAULT_AVATAR_URL)
  }, [avatar])

  return (
    <View className={`user-card ${className}`}>
      <View className='avatar-nickname' onClick={user ? onEdit : undefined} style={{ cursor: user ? 'pointer' : 'default' }}>
        <Image
          className='avatar'
          src={avatarSrc}
          onError={() => {
            if (avatarSrc !== DEFAULT_AVATAR_URL) setAvatarSrc(DEFAULT_AVATAR_URL)
          }}
        />
        <View className='user-info' style={{ marginLeft: 16 }}>
          <Text className='nickname'>{nickname}</Text>
          {subtitle ? <Text className='user-subtitle'>{subtitle}</Text> : null}
        </View>
      </View>
      <View className='usercard-action'>
        {children}
      </View>
    </View>
  )
}

export default UserCard
