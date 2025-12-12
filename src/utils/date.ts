// 判断 dailyMenu 的 date 字段是否等于 dateKey（支持字符串和Date对象）
export function isSameDay(menuDate: string | Date, dateKey: string): boolean {
  if (!menuDate) return false;
  if (typeof menuDate === 'string') {
    return menuDate === dateKey || menuDate.slice(0, 10) === dateKey;
  }
  if (menuDate instanceof Date) {
    return toDateKey(menuDate) === dateKey;
  }
  return false;
} 

// 将 Date 转为本地日期 key：yyyy-MM-dd（避免 toISOString() 的 UTC 偏移导致日期错一天）
export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}