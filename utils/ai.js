import { categorySummary, sumByType, monthBills } from './statistics.js'
import { daysAgo } from './date.js'

export function localAiAnalyze(bills, budget) {
  const current = monthBills(bills)
  const expense = sumByType(current, 'expense')
  const income = sumByType(current, 'income')
  const categories = categorySummary(current, 'expense')
  const top = categories[0]
  const last7 = bills.filter(i => i.type === 'expense' && i.date >= daysAgo(7)).reduce((s, i) => s + i.amount, 0)
  const prev7 = bills.filter(i => i.type === 'expense' && i.date >= daysAgo(14) && i.date < daysAgo(7)).reduce((s, i) => s + i.amount, 0)
  const usedRate = budget.total ? expense / budget.total : 0
  const riskLevel = usedRate >= 1 ? 'danger' : usedRate >= 0.8 ? 'warning' : 'normal'
  const suggestions = []

  if (top) suggestions.push(`${top.name}支出最高，占本月支出主要部分，可优先优化。`)
  if (last7 > prev7) suggestions.push(`最近一周支出比上一周增加 ${Math.round(last7 - prev7)} 元，建议关注波动。`)
  if (usedRate >= 0.8) suggestions.push('预算使用率较高，建议减少非必要消费。')
  if (!suggestions.length) suggestions.push('当前消费较稳定，继续保持记录习惯。')

  return {
    summary: `本月收入 ${income.toFixed(2)} 元，支出 ${expense.toFixed(2)} 元。${top ? '主要消费集中在' + top.name + '。' : '暂无明显消费集中分类。'}`,
    suggestions: suggestions.slice(0, 3),
    riskLevel,
    qa: '已预留通义千问接口，可在 utils/ai.js 的 requestQwenAi 中接入真实接口。'
  }
}

export function requestQwenAi(payload) {
  return Promise.resolve(localAiAnalyze(payload.bills || [], payload.budget || { total: 0 }))
}
