const OpenAI = require('openai')

const DEFAULT_SYSTEM_PROMPT = '你是一个专业的个人财务顾问，擅长分析消费数据、预算风险，并给出简洁实用的省钱建议。'

function getApiKey() {
  if (process.env.ZHIPU_API_KEY) return process.env.ZHIPU_API_KEY

  try {
    const config = require('./config.json')
    return config.envVariables && config.envVariables.ZHIPU_API_KEY
  } catch (error) {
    return ''
  }
}

exports.main = async (event, context) => {
  const { prompt, systemPrompt, stream = false } = event || {}
  const apiKey = getApiKey()

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

  if (stream && context && typeof context.callbackWxStream === 'function') {
    return new Promise((resolve, reject) => {
      client.chat.completions.create({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: systemPrompt || DEFAULT_SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        stream: true
      }).then(async (streamResponse) => {
        const stream = context.callbackWxStream()
        let fullContent = ''

        try {
          for await (const chunk of streamResponse) {
            const delta = chunk.choices[0]?.delta?.content || ''
            if (delta) {
              fullContent += delta
              stream.write({
                type: 'data',
                data: delta,
                fullContent
              })
            }
          }
          stream.write({
            type: 'end',
            data: '',
            fullContent
          })
          stream.end()
          resolve()
        } catch (error) {
          console.error('流式输出失败:', error)
          stream.write({
            type: 'error',
            error: error.message || '流式输出失败'
          })
          stream.end()
          reject(error)
        }
      }).catch((error) => {
        console.error('智谱 AI 调用失败:', error)
        const stream = context.callbackWxStream()
        stream.write({
          type: 'error',
          error: error.message || 'AI 调用失败'
        })
        stream.end()
        reject(error)
      })
    })
  }

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
