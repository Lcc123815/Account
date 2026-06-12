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
    qa: '当前使用本地规则分析，云函数配置完成后将自动使用智谱 AI。'
  }
}

function buildFinancePrompt(payload) {
  const bills = (payload.bills || []).slice(0, 50).map(item => ({
    type: item.type,
    amount: item.amount,
    category: item.category,
    date: item.date,
    remark: item.remark || ''
  }))
  const budget = payload.budget || { total: 0, categories: {} }
  const question = payload.question || '请生成本月消费分析和省钱建议。'

  return `请根据以下记账数据回答用户问题。\n\n用户问题：${question}\n\n预算数据：${JSON.stringify(budget)}\n\n账单数据：${JSON.stringify(bills)}\n\n要求：\n1. 只基于传入账单和预算数据分析。\n2. 指出消费最高的分类。\n3. 判断是否存在超预算风险。\n4. 给出 2-3 条具体省钱建议。\n5. 语言简洁，适合移动端展示。`
}

function parseAiTextToReport(text, fallback) {
  const lines = String(text || '').split('\n').map(i => i.trim()).filter(Boolean)
  const suggestions = lines.filter(i => /^[-\d.、]/.test(i)).map(i => i.replace(/^[-\d.、\s]+/, '')).slice(0, 3)

  return {
    summary: text || fallback.summary,
    suggestions: suggestions.length ? suggestions : fallback.suggestions,
    riskLevel: fallback.riskLevel,
    qa: text || fallback.qa
  }
}

function typeText(text, onStream) {
  return new Promise((resolve) => {
    const chars = String(text || '').split('')
    let index = 0
    let content = ''

    const timer = setInterval(() => {
      content += chars[index] || ''
      index += 1
      onStream(chars[index - 1] || '', content)

      if (index >= chars.length) {
        clearInterval(timer)
        resolve()
      }
    }, 18)
  })
}

export async function requestQwenAi(payload, onStream) {
  const fallback = localAiAnalyze(payload.bills || [], payload.budget || { total: 0 })

  if (typeof uniCloud === 'undefined') {
    return fallback
  }

  if (onStream && typeof onStream === 'function') {
    return new Promise((resolve) => {
      let streamed = false

      try {
        uniCloud.callFunction({
          name: 'ai-chat',
          data: {
            systemPrompt: '你是一个专业的个人财务顾问，擅长分析消费数据、预算风险，并给出简洁实用的省钱建议。',
            prompt: buildFinancePrompt(payload),
            stream: true
          },
          onProgress: (res) => {
            if (!res) return
            if (res.type === 'data') {
              streamed = true
              onStream(res.data, res.fullContent || '')
            } else if (res.type === 'end') {
              resolve(parseAiTextToReport(res.fullContent || '', fallback))
            } else if (res.type === 'error') {
              uni.showToast({ title: res.error || 'AI 分析失败', icon: 'none' })
              resolve(fallback)
            }
          }
        }).then(async (res) => {
          if (res.result && res.result.success) {
            if (!streamed) {
              await typeText(res.result.data, onStream)
            }
            resolve(parseAiTextToReport(res.result.data, fallback))
            return
          }

          uni.showToast({ title: res.result?.error || 'AI 分析失败，已使用本地分析', icon: 'none' })
          resolve(fallback)
        }).catch((error) => {
          console.error('流式调用失败:', error)
          uni.showToast({ title: '流式调用失败，已使用本地分析', icon: 'none' })
          resolve(fallback)
        })
      } catch (error) {
        console.error('调用 ai-chat 云函数失败:', error)
        uni.showToast({ title: '云函数调用失败，已使用本地分析', icon: 'none' })
        resolve(fallback)
      }
    })
  }

  try {
    const res = await uniCloud.callFunction({
      name: 'ai-chat',
      data: {
        systemPrompt: '你是一个专业的个人财务顾问，擅长分析消费数据、预算风险，并给出简洁实用的省钱建议。',
        prompt: buildFinancePrompt(payload)
      }
    })

    if (res.result && res.result.success) {
      return parseAiTextToReport(res.result.data, fallback)
    }

    uni.showToast({ title: res.result?.error || 'AI 分析失败，已使用本地分析', icon: 'none' })
    return fallback
  } catch (error) {
    console.error('调用 ai-chat 云函数失败:', error)
    uni.showToast({ title: '云函数调用失败，已使用本地分析', icon: 'none' })
    return fallback
  }
}
