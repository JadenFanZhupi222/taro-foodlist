import { View, Image, Text } from '@tarojs/components'
import './index.scss'

interface UserCardProps {
  avatar: string
  nickname: string
  onEdit?: () => void
  children?: React.ReactNode
  user?: any
  className?: string
  loading?: boolean
}

const UserCard = ({ avatar, nickname, onEdit, children, user, className = '', loading = false }: UserCardProps) => {
  return (
    <View className={`user-card ${className}`}>
      <View className='avatar-nickname' onClick={user ? onEdit : undefined} style={{ cursor: user ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}>
        <Image className='avatar' src={avatar} />
        <View className='user-info' style={{ marginLeft: 16 }}>
          <Text className='nickname'>{nickname}</Text>
        </View>
      </View>
      <View style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
        {children}
      </View>
    </View>
  )
}

export default UserCard 