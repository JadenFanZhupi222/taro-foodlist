import { View, Image, Text } from '@tarojs/components'
import { useSelector, useDispatch } from 'react-redux'
import { selectUser, selectLoginLoading } from '@/store/user/selectors'
import Taro from '@tarojs/taro'
import LoginButton from '@/components/LoginButton'
import './index.scss'
import Loading from '@/components/Loading'
import UserCard from '@/components/profile/userCard'
import { login } from '@/thunks/user/thunks'
import type { AppDispatch } from '@/store'

// 云存储fileID路径
const historyIcon = 'cloud://dev-4gs517j09b896e44.6465-dev-4gs517j09b896e44-1361692354/assets/icons/history.png'
const favoriteIcon = 'cloud://dev-4gs517j09b896e44.6465-dev-4gs517j09b896e44-1361692354/assets/icons/favorite.png'
const familyIcon = 'cloud://dev-4gs517j09b896e44.6465-dev-4gs517j09b896e44-1361692354/assets/icons/family.png'
const notificationIcon = 'cloud://dev-4gs517j09b896e44.6465-dev-4gs517j09b896e44-1361692354/assets/icons/notification.png'
const privacyIcon = 'cloud://dev-4gs517j09b896e44.6465-dev-4gs517j09b896e44-1361692354/assets/icons/privacy.png'
const arrowIcon = 'cloud://dev-4gs517j09b896e44.6465-dev-4gs517j09b896e44-1361692354/assets/icons/arrow-right.png'
const profileIcon = 'cloud://dev-4gs517j09b896e44.6465-dev-4gs517j09b896e44-1361692354/assets/icons/profile.png'

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

const Profile = () => {
  const user = useSelector(selectUser)
  const loginLoading = useSelector(selectLoginLoading)
  const dispatch = useDispatch<AppDispatch>()

  // 生成稳定的"微信用户xxxxx"（避免 Math.random 每次渲染变化）
  const getDefaultNickname = () => (user?._id ? '微信用户' + user._id.slice(-5) : '微信用户')

  // 判断显示头像和昵称
  const displayAvatar = !user ? defaultAvatarUrl : user.avatar

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
      icon: historyIcon,
      path: '/pages/history/index'
    },
    {
      title: '我的收藏',
      icon: favoriteIcon,
      path: '/pages/favorites/index'
    },
    {
      title: '家庭管理',
      icon: familyIcon,
      path: '/pages/family/index'
    }
  ]

  // 设置列表项
  const settingItems = [
    {
      title: '通知设置',
      icon: notificationIcon,
      path: '/pages/settings/notification/index'
    },
    {
      title: '隐私设置',
      icon: privacyIcon,
      path: '/pages/settings/privacy/index'
    },
    {
      title: '关于我们',
      icon: profileIcon,
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
      {!user ? (
        /* 未登录：醒目的登录 CTA，替代角落小按钮 + 引导遮罩 */
        <View className='login-cta'>
          <Image className='login-cta__avatar' src={defaultAvatarUrl} />
          <Text className='login-cta__title'>登录享受完整功能</Text>
          <Text className='login-cta__subtitle'>登录后可创建家庭、收藏与同步每日菜单</Text>
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
        <Text className='section-title'>功能</Text>
        <View className='menu-list'>
          {menuItems.map(item => (
            <View 
              key={item.title}
              className='menu-item'
              onClick={() => handleItemClick(item.path)}
            >
              <Image className='menu-icon' src={item.icon} />
              <Text className='menu-title'>{item.title}</Text>
              <Image className='arrow-icon' src={arrowIcon} />
            </View>
          ))}
        </View>
      </View>

      {/* 设置列表 */}
      <View className='menu-section'>
        <Text className='section-title'>设置</Text>
        <View className='menu-list'>
          {settingItems.map(item => (
            <View 
              key={item.title}
              className='menu-item'
              onClick={() => handleItemClick(item.path)}
            >
              <Image className='menu-icon' src={item.icon} />
              <Text className='menu-title'>{item.title}</Text>
              <Image className='arrow-icon' src={arrowIcon} />
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default Profile 