import SettingPage from '@/components/SettingPage'
import './index.scss'

export default function Favorites() {
  return <SettingPage eyebrow='留住家里的喜欢' title='我的收藏' description='这里会承接现有收藏入口，不新增或模拟尚未接入的数据。' symbol='藏' items={[{ title: '收藏能力', description: '当前版本暂未开放独立收藏数据', value: '未启用' }, { title: '家庭食谱', description: '你仍可以在食谱库查看家人共同记录的菜谱', value: '可查看' }]} note='我们不会为了页面看起来丰富而生成虚假的收藏数量或记录。' />
}
