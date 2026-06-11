const OpenAI = require('openai')

const DEFAULT_SYSTEM_PROMPT = '你是一个专业的个人财务顾问，擅长分析消费数据、预算风险，并给出简洁实用的省钱建议。'

exports.main = async (event) => {
  const { prompt, systemPrompt } = event || {}
  const apiKey = process.env.ZHIPU_API_KEY

  if (!apiKey) {
    return {
      success: false,
      error: '未配置 ZHIPU_API_KEY，请在 uniCloud 云函数环境变量中配置智谱 AI API Key。'
    }
  }

  if (!prompt) {
    return {
      success: false,
      error: 'prompt 不能为空'
    }
  }

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://open.bigmodel.cn/api/paas/v4/'
  })

  try {
    const response = await client.chat.completions.create({
      model: 'glm-4-flash',
      messages: [
        { role: 'system', content: systemPrompt || DEFAULT_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })

    return {
      success: true,
      data: response.choices[0].message.content
    }
  } catch (error) {
    console.error('智谱 AI 调用失败:', error)
    return {
      success: false,
      error: error.message || 'AI 调用失败'
    }
  }
}
