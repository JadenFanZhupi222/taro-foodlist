import { View, Text } from '@tarojs/components'
import MemberCard from '../memberCard'

interface Member {
  openId: string
  avatar: string
  nickname: string
  role: 'owner' | 'member'
}

interface MemberCardListProps {
  members: Member[]
  currentUserId?: string
}

export default function MemberCardList({ members, currentUserId }: MemberCardListProps) {
  return (
    <View className='member-list'>
      {members && members.length > 0 ? (
        members.map((m) => {
          const isMe = m.openId === currentUserId
          const role = m.role === 'owner' ? 'owner' : 'member'
          return (
            <MemberCard
              key={m.openId}
              avatar={m.avatar}
              name={m.nickname || m.openId}
              role={role}
              isMe={isMe}
            />
          )
        })
      ) : (
        <Text>暂无成员</Text>
      )}
    </View>
  )
}
