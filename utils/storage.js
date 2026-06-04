const BILL_KEY = 'xiaozhangling_bills'
const BUDGET_KEY = 'xiaozhangling_budget'

function mockBills() {
  const now = Date.now()
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return [
    { id: 'mock-1', type: 'income', amount: 5200, category: '工资', date: `${year}-${month}-01`, remark: '本月工资', createTime: now - 9000, updateTime: now - 9000 },
    { id: 'mock-2', type: 'expense', amount: 28, category: '餐饮', date: `${year}-${month}-02`, remark: '早餐', createTime: now - 8000, updateTime: now - 8000 },
    { id: 'mock-3', type: 'expense', amount: 56, category: '餐饮', date: `${year}-${month}-03`, remark: '午餐', createTime: now - 7000, updateTime: now - 7000 },
    { id: 'mock-4', type: 'expense', amount: 120, category: '购物', date: `${year}-${month}-04`, remark: '生活用品', createTime: now - 6000, updateTime: now - 6000 },
    { id: 'mock-5', type: 'expense', amount: 18, category: '交通', date: `${year}-${month}-05`, remark: '地铁出行', createTime: now - 5000, updateTime: now - 5000 },
    { id: 'mock-6', type: 'income', amount: 300, category: '兼职', date: `${year}-${month}-06`, remark: '周末兼职', createTime: now - 4000, updateTime: now - 4000 },
    { id: 'mock-7', type: 'expense', amount: 88, category: '娱乐', date: `${year}-${month}-07`, remark: '电影票', createTime: now - 3000, updateTime: now - 3000 },
    { id: 'mock-8', type: 'expense', amount: 199, category: '学习', date: `${year}-${month}-08`, remark: '课程资料', createTime: now - 2000, updateTime: now - 2000 },
    { id: 'mock-9', type: 'expense', amount: 35, category: '医疗', date: `${year}-${month}-09`, remark: '常用药品', createTime: now - 1000, updateTime: now - 1000 },
    { id: 'mock-10', type: 'expense', amount: 260, category: '购物', date: `${year}-${month}-10`, remark: '衣物购买', createTime: now, updateTime: now }
  ]
}

export function getBills() {
  const bills = uni.getStorageSync(BILL_KEY)
  return bills && bills.length ? bills : mockBills()
}

export function saveBills(bills) {
  uni.setStorageSync(BILL_KEY, bills)
}

export function getBudget() {
  return uni.getStorageSync(BUDGET_KEY) || {
    total: 3000,
    categories: {
      餐饮: 1000,
      购物: 800,
      交通: 300,
      娱乐: 400,
      学习: 300,
      其他: 200
    }
  }
}

export function saveBudget(budget) {
  uni.setStorageSync(BUDGET_KEY, budget)
}