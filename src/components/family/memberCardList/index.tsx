import { View, Text } from '@tarojs/components'
import MemberCard from '../memberCard'
import './index.scss'

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
  const maxCount = 10;
  return (
    <View className='member-list-bg'>
      <View className='member-list-header'>
        <Text className='member-list-count'>{members.length}/{maxCount}</Text>
      </View>
      <View className='member-list-scroll'>
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
    </View>
  )
}
