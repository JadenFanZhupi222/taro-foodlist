import { View, Image, Text } from '@tarojs/components'
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
  return (
    <View className={`user-card ${className}`}>
      <View className='avatar-nickname' onClick={user ? onEdit : undefined} style={{ cursor: user ? 'pointer' : 'default' }}>
        <Image className='avatar' src={avatar} />
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