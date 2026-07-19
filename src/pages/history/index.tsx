import SettingPage from '@/components/SettingPage'
import './index.scss'

export default function History() {
  return <SettingPage eyebrow='家的饮食记忆' title='浏览历史' description='保留现有页面入口，并明确当前版本的数据边界。' symbol='历' items={[{ title: '浏览记录', description: '当前版本不会保存个人浏览轨迹', value: '未启用' }, { title: '隐私保护', description: '没有浏览历史数据就不会产生额外留存', value: '安心' }]} note='日后如开放历史能力，会先说明保存范围，并提供清除方式。' />
}
