import { Button } from '@tarojs/components'
import { toast } from '@/utils/toast'
import './index.scss'

interface ShareInvitationBtnProps {
  className?: string
  style?: React.CSSProperties
}

const ShareInvitationBtn = ({ className = '', style }: ShareInvitationBtnProps) => {
  const handleClick = () => {
    toast({ title: '请点击右上角"···"分享邀请成员', icon: 'none' })
  }

  return (
    <Button
      className={`invite-btn ${className}`}
      style={style}
      onClick={handleClick}
    >
      邀请成员
    </Button>
  )
}

export default ShareInvitationBtn
