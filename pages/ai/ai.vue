<template>
  <view class="ai-page">
    <view class="top-card">
      <view class="assistant-avatar">AI</view>
      <view class="top-main">
        <view class="page-title">AI 消费分析</view>
        <view class="page-desc">智谱 AI 智能分析你的消费</view>
      </view>
      <button class="small-btn" @click="analyze">生成</button>
    </view>

    <view class="tab-row">
      <view class="tab" :class="activeTab === 'analysis' ? 'active' : ''" @click="activeTab = 'analysis'">分析</view>
      <view class="tab" :class="activeTab === 'question' ? 'active' : ''" @click="activeTab = 'question'">提问</view>
    </view>

    <view v-if="activeTab === 'analysis'" class="card">
      <view class="section-head">
        <view>
          <view class="section-title">分析摘要</view>
          <view class="section-sub">根据账单和预算生成</view>
        </view>
        <view class="risk-tag" :class="report.riskLevel">{{ riskText }}</view>
      </view>
      <view class="summary">{{ report.summary }}</view>
    </view>

    <view v-if="activeTab === 'analysis'" class="card">
      <view class="section-title">省钱建议</view>
      <view v-for="(item, index) in report.suggestions" :key="index" class="suggestion-item">
        <view class="suggestion-no">{{ index + 1 }}</view>
        <view class="suggestion-text">{{ item }}</view>
      </view>
    </view>

    <view v-if="activeTab === 'question'" class="card question-card">
      <view class="section-title">自然语言提问</view>
      <view class="section-sub">可以询问消费最高分类、预算风险或省钱建议</view>
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input class="question-input" :value="question" placeholder="例如：我本月哪里花得最多？" @input="question = $event.detail.value" />
      </view>
      <button class="ask-btn" @click="ask">发送问题</button>
      <view class="answer-box">
        <view class="answer-title">AI 回复</view>
        <view class="answer-text">{{ answer }}</view>
      </view>
    </view>

    <view class="quick-card">
      <view class="section-title">快捷问题</view>
      <view class="quick-list">
        <view v-for="item in quickQuestions" :key="item" class="quick-item" @click="fillQuestion(item)">{{ item }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getBills, getBudget } from '../../utils/storage.js'
import { localAiAnalyze, requestQwenAi } from '../../utils/ai.js'

export default {
  data() {
    return {
      activeTab: 'analysis',
      report: {
        summary: '点击生成，查看本月消费结构、异常消费和预算风险。',
        suggestions: ['坚持记录每一笔支出。'],
        riskLevel: 'normal'
      },
      question: '',
      answer: '你可以询问消费最高分类、预算风险或省钱建议。',
      quickQuestions: ['本月哪里花得最多？', '有没有超预算风险？', '给我三条省钱建议']
    }
  },
  computed: {
    riskText() {
      if (this.report.riskLevel === 'danger') return '高风险'
      if (this.report.riskLevel === 'warning') return '需关注'
      return '正常'
    }
  },
  onShow() {
    this.analyze()
  },
  methods: {
    async analyze() {
      uni.showLoading({ title: 'AI 分析中...' })
      const bills = getBills()
      const budget = getBudget()
      try {
        const res = await requestQwenAi({ bills, budget })
        this.report = res
        uni.hideLoading()
      } catch {
        this.report = localAiAnalyze(bills, budget)
        uni.hideLoading()
      }
    },
    fillQuestion(text) {
      this.question = text
      this.activeTab = 'question'
    },
    async ask() {
      const question = this.question.trim()
      if (!question) {
        uni.showToast({ title: '请输入问题', icon: 'none' })
        return
      }
      uni.showLoading({ title: 'AI 思考中...' })
      try {
        const res = await requestQwenAi({ question, bills: getBills(), budget: getBudget() })
        this.answer = `${res.summary} ${res.suggestions.join('')}`
      } catch {
        this.answer = 'AI 回答失败，请稍后重试'
      } finally {
        uni.hideLoading()
      }
    }
  }
}
</script>

<style scoped>
.ai-page {
  min-height: 100vh;
  padding: 28rpx;
  padding-bottom: 120rpx;
  background: #f4f7fb;
  box-sizing: border-box;
}

.top-card,
.card,
.quick-card {
  background: #fff;
  border-radius: 26rpx;
  box-shadow: 0 12rpx 34rpx rgba(47, 128, 237, .08);
}

.top-card {
  display: flex;
  align-items: center;
  gap: 22rpx;
  padding: 28rpx;
}

.assistant-avatar {
  width: 82rpx;
  height: 82rpx;
  line-height: 82rpx;
  text-align: center;
  border-radius: 50%;
  background: #4f8fe8;
  color: #fff;
  font-size: 28rpx;
  font-weight: 800;
}

.top-main {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #111;
}

.page-desc,
.section-sub {
  margin-top: 8rpx;
  color: #999;
  font-size: 24rpx;
}

.small-btn {
  width: 116rpx;
  height: 58rpx;
  line-height: 58rpx;
  margin: 0;
  border-radius: 999rpx;
  background: #4f8fe8;
  color: #fff;
  font-size: 24rpx;
}

.tab-row {
  display: flex;
  gap: 18rpx;
  margin: 28rpx 0;
}

.tab {
  height: 56rpx;
  line-height: 56rpx;
  padding: 0 42rpx;
  border-radius: 999rpx;
  background: #e9eef5;
  color: #8996a8;
  font-size: 26rpx;
}

.tab.active {
  border: 2rpx solid #4f8fe8;
  background: #fff;
  color: #4f8fe8;
  font-weight: 700;
}

.card,
.quick-card {
  margin-top: 24rpx;
  padding: 28rpx;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 800;
  color: #111;
}

.risk-tag {
  height: 46rpx;
  line-height: 46rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: #eef5ff;
  color: #4f8fe8;
  font-size: 24rpx;
  font-weight: 700;
}

.risk-tag.warning {
  background: #fff3e8;
  color: #f2a35e;
}

.risk-tag.danger {
  background: #fff0f0;
  color: #f03030;
}

.summary {
  margin-top: 24rpx;
  color: #334155;
  font-size: 28rpx;
  line-height: 1.7;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
  padding: 22rpx 0;
  border-bottom: 1rpx solid #eeeeee;
}

.suggestion-item:last-child {
  border-bottom: 0;
}

.suggestion-no {
  width: 44rpx;
  height: 44rpx;
  line-height: 44rpx;
  text-align: center;
  border-radius: 50%;
  background: #eef5ff;
  color: #4f8fe8;
  font-size: 24rpx;
  font-weight: 800;
}

.suggestion-text {
  flex: 1;
  color: #334155;
  font-size: 26rpx;
  line-height: 1.6;
}

.search-box {
  height: 76rpx;
  display: flex;
  align-items: center;
  margin-top: 24rpx;
  padding: 0 22rpx;
  border-radius: 20rpx;
  background: #f4f7fb;
}

.search-icon {
  margin-right: 10rpx;
  color: #999;
  font-size: 24rpx;
}

.question-input {
  flex: 1;
  height: 76rpx;
  color: #111;
  font-size: 28rpx;
}

.ask-btn {
  height: 82rpx;
  line-height: 82rpx;
  margin-top: 22rpx;
  border-radius: 999rpx;
  background: #4f8fe8;
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

.answer-box {
  margin-top: 24rpx;
  padding: 24rpx;
  border-radius: 22rpx;
  background: #f8fafc;
}

.answer-title {
  color: #111;
  font-size: 26rpx;
  font-weight: 800;
}

.answer-text {
  margin-top: 12rpx;
  color: #475569;
  font-size: 26rpx;
  line-height: 1.7;
}

.quick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 22rpx;
}

.quick-item {
  padding: 16rpx 22rpx;
  border-radius: 999rpx;
  background: #eef5ff;
  color: #4f8fe8;
  font-size: 24rpx;
}
</style>
