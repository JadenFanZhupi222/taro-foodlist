Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/index/index', text: '食谱', icon: 'book' },
      { pagePath: '/pages/today/index', text: '今日', icon: 'plate' },
      { pagePath: '/pages/profile/index', text: '我的', icon: 'person' }
    ]
  },
  methods: {
    switchTab (event) {
      const { index, path } = event.currentTarget.dataset
      if (index === this.data.selected) return
      this.setData({ selected: index })
      wx.switchTab({ url: path })
    }
  }
})
