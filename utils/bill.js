export const expenseCategories = ['餐饮', '购物', '交通', '娱乐', '学习', '医疗', '住房', '其他']
export const incomeCategories = ['工资', '兼职', '奖金', '理财', '红包', '其他']

export function createBill(data) {
  const now = Date.now()
  return {
    id: String(now) + Math.random().toString(16).slice(2),
    type: data.type || 'expense',
    amount: Number(data.amount || 0),
    category: data.category || '其他',
    date: data.date || today(),
    remark: data.remark || '',
    createTime: now,
    updateTime: now
  }
}

export function updateBill(oldBill, data) {
  return {
    ...oldBill,
    ...data,
    amount: Number(data.amount || 0),
    updateTime: Date.now()
  }
}

export function filterBills(bills, filters = {}) {
  return bills.filter(item => {
    const dateOk = !filters.date || item.date === filters.date
    const categoryOk = !filters.category || filters.category === '全部' || item.category === filters.category
    const typeOk = !filters.type || filters.type === '全部' || item.type === filters.type
    return dateOk && categoryOk && typeOk
  })
}

export function today() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
