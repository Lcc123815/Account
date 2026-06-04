<template>
  <view class="container">
    <view class="hero card">
      <view>
        <view class="title">AI 消费分析</view>
        <view class="muted">本地规则分析，预留通义千问接入</view>
      </view>
      <button class="primary-btn btn" @click="analyze">一键生成</button>
    </view>

    <view class="card result">
      <view class="sub-title">分析摘要</view>
      <view class="summary">{{ report.summary }}</view>
      <view class="risk" :class="report.riskLevel">风险等级：{{ riskText }}</view>
    </view>

    <view class="card result">
      <view class="sub-title">省钱建议</view>
      <view v-for="(item, index) in report.suggestions" :key="index" class="suggestion">{{ index + 1 }}. {{ item }}</view>
    </view>

    <view class="card result">
      <view class="sub-title">自然语言提问</view>
      <input class="question" :value="question" placeholder="例如：我本月哪里花得最多？" @input="question = $event.detail.value" />
      <button class="ask" @click="ask">提问</button>
      <view class="answer">{{ answer }}</view>
    </view>

    <AiBubble :status="report.riskLevel" :text="bubble" />
    <ThreeAssistant :status="report.riskLevel === 'normal' ? 'thinking' : report.riskLevel" @tap="analyze" />
  </view>
</template>

<script>
import AiBubble from '../../components/AiBubble/AiBubble.vue'
import ThreeAssistant from '../../components/ThreeAssistant/ThreeAssistant.vue'
import { getBills, getBudget } from '../../utils/storage.js'
import { localAiAnalyze, requestQwenAi } from '../../utils/ai.js'

export default {
  components: { AiBubble, ThreeAssistant },
  data() {
    return {
      report: { summary: '点击一键生成，查看本月消费结构、异常消费和预算风险。', suggestions: ['坚持记录每一笔支出。'], riskLevel: 'normal' },
      question: '',
      answer: '你可以询问消费最高分类、预算风险或省钱建议。'
    }
  },
  computed: {
    riskText() { return this.report.riskLevel === 'danger' ? '高风险' : this.report.riskLevel === 'warning' ? '需关注' : '正常' },
    bubble() { return this.report.suggestions[0] || '我可以帮你分析消费。' }
  },
  onShow() { this.analyze() },
  methods: {
    analyze() {
      const bills = getBills()
      const budget = getBudget()
      this.report = localAiAnalyze(bills, budget)
    },
    ask() {
      if (!this.question) {
        uni.showToast({ title: '请输入问题', icon: 'none' })
        return
      }
      requestQwenAi({ question: this.question, bills: getBills(), budget: getBudget() }).then(res => {
        this.answer = `${res.summary} ${res.suggestions.join('')}`
      })
    }
  }
}
</script>

<style scoped>
.hero { display: flex; justify-content: space-between; align-items: center; }
.btn { width: 180rpx; height: 70rpx; line-height: 70rpx; margin: 0; font-size: 24rpx; }
.result { margin-top: 24rpx; }
.summary { margin-top: 20rpx; line-height: 1.7; color: #334155; font-size: 28rpx; }
.risk { margin-top: 18rpx; font-weight: 800; color: #10b981; }
.risk.warning { color: #f59e0b; }
.risk.danger { color: #ef4444; }
.suggestion { padding: 18rpx 0; border-bottom: 1rpx solid #e2e8f0; color: #334155; font-size: 26rpx; line-height: 1.6; }
.question { margin-top: 20rpx; padding: 22rpx; border-radius: 18rpx; background: #f1f5f9; }
.ask { margin-top: 18rpx; border-radius: 18rpx; color: #fff; background: #2563eb; }
.answer { margin-top: 20rpx; color: #475569; line-height: 1.7; }
</style>
