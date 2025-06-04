// 判断 dailyMenu 的 date 字段是否等于 dateKey（支持字符串和Date对象）
export function isSameDay(menuDate: string | Date, dateKey: string): boolean {
  if (!menuDate) return false;
  if (typeof menuDate === 'string') {
    return menuDate === dateKey || menuDate.slice(0, 10) === dateKey;
  }
  if (menuDate instanceof Date) {
    return menuDate.toISOString().slice(0, 10) === dateKey;
  }
  return false;
} 