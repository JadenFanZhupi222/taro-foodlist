import SettingPage from '@/components/SettingPage'
import './index.scss'

export default function About() {
  return <SettingPage eyebrow='把家的味道留下来' title='关于家的食谱' description='一款为家人共同记录与安排日常饮食的小程序。' symbol='家' items={[{ title: '食谱库', description: '记录家里常做的菜、食材和步骤', value: '共同维护' }, { title: '今日菜单', description: '从家庭食谱中安排今天想吃的菜', value: '轻松计划' }, { title: '家庭空间', description: '邀请家人一起补充熟悉的味道', value: '一起记录' }]} note='我们希望它像家里的手写菜谱一样亲切，但比纸张更容易共同维护。' />
}
