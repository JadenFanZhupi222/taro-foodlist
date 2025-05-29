import { View, Image, Text } from '@tarojs/components'
import { useSelector, useDispatch } from 'react-redux'
import { selectUser } from '@/store/user/selectors'
import Taro from '@tarojs/taro'
import LoginButton from '@/components/LoginButton'
import './index.scss'

// 导入图标
import historyIcon from '@/assets/icons/history.png'
import favoriteIcon from '@/assets/icons/favorite.png'
import familyIcon from '@/assets/icons/family.png'
import notificationIcon from '@/assets/icons/notification.png'
import privacyIcon from '@/assets/icons/privacy.png'
import arrowIcon from '@/assets/icons/arrow-right.png'
import profileIcon from '@/assets/icons/profile.png'

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

const Profile = () => {
  const user = useSelector(selectUser)
  const dispatch = useDispatch()

  // 生成"微信用户xxxxx"
  const getDefaultNickname = () => {
    if (user?._id) {
      return '微信用户' + user._id.slice(-5)
    }
    return '微信用户' + Math.floor(Math.random() * 100000)
  }

  // 判断显示头像和昵称
  const displayAvatar = !user ? defaultAvatarUrl : user.avatar
  console.log('displayAvatar', displayAvatar)

  const displayNickname = !user
    ? '未登录'
    : user.nickname && user.nickname.trim() !== ''
      ? user.nickname
      : getDefaultNickname()

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
      path: '/pages/settings/notification'
    },
    {
      title: '隐私设置',
      icon: privacyIcon,
      path: '/pages/settings/privacy'
    },
    {
      title: '关于我们',
      icon: profileIcon,
      path: '/pages/settings/about'
    }
  ]

  const handleItemClick = (path: string) => {
    if (!user && path !== '/pages/settings/about') {
      Taro.showModal({
        title: '提示',
        content: '请先登录',
        success: (res) => {
          if (res.confirm) {
            // 登录按钮会通过 dispatch 触发登录逻辑
          }
        }
      })
      return
    }
    Taro.navigateTo({ url: path })
  }

  return (
    <View className='profile'>
      {/* 用户信息卡片 */}
      <View className='user-card'>
        <View className='avatar-nickname' onClick={user ? handleEdit : undefined} style={{ cursor: user ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}>
          <Image className='avatar' src={displayAvatar} />
          <View className='user-info' style={{ marginLeft: 16 }}>
            <Text className='nickname'>{displayNickname}</Text>
            {user && null}
          </View>
        </View>
        <View style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
          <LoginButton className='edit-btn' />
        </View>
      </View>

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