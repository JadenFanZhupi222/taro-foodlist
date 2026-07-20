import SettingPage from '@/components/SettingPage'
import './index.scss'

export default function PrivacySettings() {
  return <SettingPage eyebrow='只在家人之间共享' title='隐私说明' description='家庭食谱的数据用途保持简单、透明。' symbol='隐' items={[{ title: '家庭资料', description: '昵称和头像用于家庭成员之间识别', value: '家庭可见' }, { title: '食谱内容', description: '菜名、图片、食材和步骤用于家庭共同查看', value: '家庭共享' }, { title: '浏览轨迹', description: '当前版本不保存独立浏览历史', value: '不记录' }]} note='退出家庭、删除食谱等操作仍遵循现有业务规则，本次 UI 改造不改变任何数据处理方式。' />
}
