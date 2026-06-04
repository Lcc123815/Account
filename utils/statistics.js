export function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function monthBills(bills, month = currentMonth()) {
  return bills.filter(item => item.date && item.date.slice(0, 7) === month)
}

export function sumByType(bills, type) {
  return bills.filter(item => item.type === type).reduce((sum, item) => sum + Number(item.amount || 0), 0)
}

export function categorySummary(bills, type = 'expense') {
  const map = {}
  bills.filter(item => item.type === type).forEach(item => {
    map[item.category] = (map[item.category] || 0) + Number(item.amount || 0)
  })
  return Object.keys(map).map(name => ({ name, value: Number(map[name].toFixed(2)) })).sort((a, b) => b.value - a.value)
}

export function monthlyTrend(bills) {
  const map = {}
  bills.forEach(item => {
    const month = item.date.slice(0, 7)
    if (!map[month]) map[month] = { month, income: 0, expense: 0 }
    map[month][item.type] += Number(item.amount || 0)
  })
  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
}
