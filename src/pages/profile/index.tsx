import { View, Image, Text } from '@tarojs/components'
import { useSelector, useDispatch } from 'react-redux'
import { selectUser, selectLoginLoading } from '@/store/user/selectors'
import Taro, { useDidShow } from '@tarojs/taro'
import LoginButton from '@/components/LoginButton'
import './index.scss'
import Loading from '@/components/Loading'
import UserCard from '@/components/profile/userCard'
import { login } from '@/thunks/user/thunks'
import type { AppDispatch } from '@/store'
import { DEFAULT_AVATAR_URL } from '@/constants/avatar'

const Profile = () => {
  const user = useSelector(selectUser)
  const loginLoading = useSelector(selectLoginLoading)
  const dispatch = useDispatch<AppDispatch>()

  useDidShow(() => {
    const page = Taro.getCurrentInstance().page
    ;(page as any)?.getTabBar?.()?.setData({ selected: 2 })
  })

  // 生成稳定的"微信用户xxxxx"（避免 Math.random 每次渲染变化）
  const getDefaultNickname = () => (user?._id ? '微信用户' + user._id.slice(-5) : '微信用户')

  // 判断显示头像和昵称
  const displayAvatar = user?.avatar?.trim() || DEFAULT_AVATAR_URL

  const displayNickname = !user
    ? '未登录'
    : user.nickname && user.nickname.trim() !== ''
      ? user.nickname
      : getDefaultNickname()

  // 已登录但昵称为空 → 提示完善资料
  const isDefaultProfile = !!user && (!user.nickname || user.nickname.trim() === '')

  // 点击头像或昵称跳转到编辑页
  const handleEdit = () => {
    if (user) {
      Taro.navigateTo({ url: '/pages/profile/edit/index' })
    }
  }

  // 功能列表项
  const menuItems = [
    {
      title: '历史食谱',
      icon: '时',
      path: '/pages/history/index'
    },
    {
      title: '我的收藏',
      icon: '藏',
      path: '/pages/favorites/index'
    },
    {
      title: '家庭管理',
      icon: '家',
      path: '/pages/family/index'
    }
  ]

  // 设置列表项
  const settingItems = [
    {
      title: '通知设置',
      icon: '知',
      path: '/pages/settings/notification/index'
    },
    {
      title: '隐私设置',
      icon: '隐',
      path: '/pages/settings/privacy/index'
    },
    {
      title: '关于我们',
      icon: '关',
      path: '/pages/settings/about/index'
    }
  ]

  const handleItemClick = (path: string) => {
    if (!user && path !== '/pages/settings/about/index') {
      Taro.showModal({
        title: '未登录',
        content: '登录后即可使用，是否立即登录？',
        confirmText: '去登录',
        cancelText: '暂不',
        success: (res) => {
          if (res.confirm) dispatch(login())
        }
      })
      return
    }
    Taro.navigateTo({ url: path })
  }

  return (
    <View className='profile'>
      <Loading visible={loginLoading} mask={true} />
      <View className='profile-header'>
        <Text className='profile-header__eyebrow'>账户与家庭</Text>
        <Text className='profile-header__title'>我的</Text>
      </View>
      {!user ? (
        /* 未登录：醒目的登录 CTA，替代角落小按钮 + 引导遮罩 */
        <View className='login-cta'>
          <Image className='login-cta__avatar' src={DEFAULT_AVATAR_URL} />
          <Text className='login-cta__title'>把家里的味道存下来</Text>
          <Text className='login-cta__subtitle'>登录后可与家人共享食谱、收藏和每日菜单</Text>
          <LoginButton className='login-cta__btn' />
        </View>
      ) : (
        /* 已登录：用户信息卡片 */
        <UserCard
          avatar={displayAvatar}
          nickname={displayNickname}
          subtitle={isDefaultProfile ? '点头像完善昵称与头像 >' : undefined}
          onEdit={handleEdit}
          user={user}
        >
          <LoginButton className='edit-btn' />
        </UserCard>
      )}
      {/* 功能列表 */}
      <View className='menu-section'>
        <Text className='section-title'>常用功能</Text>
        <View className='menu-list'>
          {menuItems.map(item => (
            <View 
              key={item.title}
              className='menu-item'
              onClick={() => handleItemClick(item.path)}
            >
              <View className='menu-icon'>{item.icon}</View>
              <Text className='menu-title'>{item.title}</Text>
              <View className='arrow-icon' />
            </View>
          ))}
        </View>
      </View>

      {/* 设置列表 */}
      <View className='menu-section'>
        <Text className='section-title'>偏好与设置</Text>
        <View className='menu-list'>
          {settingItems.map(item => (
            <View 
              key={item.title}
              className='menu-item'
              onClick={() => handleItemClick(item.path)}
            >
              <View className='menu-icon'>{item.icon}</View>
              <Text className='menu-title'>{item.title}</Text>
              <View className='arrow-icon' />
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default Profile
