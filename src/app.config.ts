export default defineAppConfig({
  pages: [
    'pages/index/index',  // 食谱库
    'pages/today/index',  // 今日食谱
    'pages/profile/index',
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
  },
  subPackages: [
    {
      root: 'pages/today/addRecipes',
      pages: ['index']
    },
    {
      root: 'pages/recipe/detail',
      pages: ['index']
    },
    {
      root: 'pages/recipe/edit',
      pages: ['index']
    },
    {
      root: 'pages/profile/edit',
      pages: ['index']
    },
    {
      root: 'pages/family',
      pages: ['index', 'acceptInvite/index']
    },
    {
      root: 'pages/history',
      pages: ['index']
    },
    {
      root: 'pages/favorites',
      pages: ['index']
    },
    {
      root: 'pages/settings/notification',
      pages: ['index']
    },
    {
      root: 'pages/settings/privacy',
      pages: ['index']
    },
    {
      root: 'pages/settings/about',
      pages: ['index']
    }
  ],
  lazyCodeLoading: 'requiredComponents'
})
