export default defineAppConfig({
  pages: [
    'pages/index/index',  // 食谱库
    'pages/recipe/detail/index', // 食谱详情
    'pages/recipe/edit/index', // 食谱编辑
    'pages/today/index',  // 今日食谱
    'pages/today/addRecipes/index', // 添加食谱页面
    'pages/profile/index', // 个人中心
    'pages/profile/edit/index', // 个人中心编辑
    'pages/family/index',  // 家庭管理
    'pages/family/acceptInvite/index', // 接受家庭邀请
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '家庭食谱',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f5f5f5'
  },
  tabBar: {
    color: '#999',
    selectedColor: '#ff6b6b',
    backgroundColor: '#fff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '食谱库',
        iconPath: 'assets/icons/recipe.png',
        selectedIconPath: 'assets/icons/recipe-active.png'
      },
      {
        pagePath: 'pages/today/index',
        text: '今日食谱',
        iconPath: 'assets/icons/today.png',
        selectedIconPath: 'assets/icons/today-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/icons/profile.png',
        selectedIconPath: 'assets/icons/profile-active.png'
      }
    ]
  }
})
