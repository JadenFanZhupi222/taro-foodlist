const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/

function normalizeDateKey(value) {
  if (typeof value === 'string' && DATE_KEY.test(value)) return value

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) throw new TypeError('invalid date')

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

function makeMenuKey(familyId, date) {
  if (!familyId) throw new TypeError('familyId is required')
  return `${encodeURIComponent(familyId)}_${normalizeDateKey(date)}`
}

module.exports = { normalizeDateKey, makeMenuKey }
