import Taro from '@tarojs/taro'

interface ToastOptions {
  title: string
  icon?: 'success' | 'error' | 'none' | 'loading'
  duration?: number
  mask?: boolean
}

export function showToast({ title, icon = 'none', duration = 2000, mask = true }: ToastOptions) {
  Taro.showToast({ title, icon, duration, mask })
}

// 便捷调用
export const toast = showToast 