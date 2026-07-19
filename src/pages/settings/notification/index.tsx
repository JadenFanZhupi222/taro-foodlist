import SettingPage from '@/components/SettingPage'
import './index.scss'

export default function NotificationSettings() {
  return <SettingPage eyebrow='饭点少一点打扰' title='通知设置' description='提醒能力以微信系统授权和现有业务接入为准。' symbol='铃' items={[{ title: '今日菜单提醒', description: '当前版本尚未接入主动订阅消息', value: '未启用' }, { title: '家庭动态', description: '新增菜谱不会额外推送通知', value: '安静' }, { title: '系统权限', description: '未来开启时仍需由你在微信中主动授权', value: '由你决定' }]} note='这里不会展示虚假的开关状态，也不会在未经授权时发送消息。' />
}
