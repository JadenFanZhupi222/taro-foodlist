import { View, Text, Image } from '@tarojs/components'
import './index.scss'

interface MemberCardProps {
  avatar: string
  name: string
  role: 'owner' | 'member'
  isMe?: boolean
}

export default function MemberCard({ avatar, name, role, isMe }: MemberCardProps) {
  return (
    <View className={`member-row${isMe ? ' me' : ''}`}>
      <Image className='member-avatar' src={avatar} />
      <Text className='member-name'>{name}</Text>
      <Text className={`member-role ${role}`}>{role === 'owner' ? '家庭管理员' : '成员'}</Text>
    </View>
  )
}
