<template>
  <view class="ai-page">
    <view class="blue-header">
      <view class="hero-copy">
        <view class="page-title">AI 财务助手</view>
      </view>
    </view>

    <view class="content-scroll">
      <view class="answer-card">
        <view class="section-head">
          <view>
            <view class="section-title">AI 回复</view>
          </view>
          <view v-if="answering" class="status-pill">思考中</view>
        </view>
        <view class="answer-bubble" :class="answer ? '' : 'empty'">
          {{ answer || 'AI 的分析回复会显示在这里。点击小人或选择快捷问题开始提问。' }}
        </view>
      </view>

      <view class="quick-card">
        <view class="section-head compact">
          <view class="section-title">快捷问题</view>
        </view>
        <view class="quick-list">
          <view v-for="(item, index) in quickQuestions" :key="item.text" class="quick-item" :style="{ animationDelay: index * 60 + 'ms' }" @click="fillQuestion(item)">
            <view class="quick-icon">{{ item.icon }}</view>
            <view class="quick-text">{{ item.text }}</view>
          </view>
        </view>
      </view>
    </view>

    <view
      class="assistant-stage global-assistant"
      :class="assistantAction"
      :style="assistantStyle"
      @mousedown.stop="startDrag"
      @mousemove.stop="moveDrag"
      @mouseup.stop="endDrag"
      @mouseleave.stop="endDrag"
      @touchstart.stop="startTouch"
      @touchmove.stop.prevent="moveTouch"
      @touchend.stop="endDrag"
      @click.stop="handleAssistantTap"
    >
      <view class="gauss-glow"></view>
      <view class="mini-person">
        <view class="person-head">
          <view class="eye left"></view>
          <view class="eye right"></view>
          <view class="smile"></view>
        </view>
        <view class="person-body"></view>
        <view class="person-arm arm-left"></view>
        <view class="person-arm arm-right"></view>
        <view class="paper"></view>
      </view>
      <view class="cocoon-shell shell-left"></view>
      <view class="cocoon-shell shell-right"></view>
    </view>

    <view v-if="showAssistantAsk" class="ask-mask" @click="closeAssistantAsk">
      <view class="ask-panel" @click.stop>
        <view class="ask-title">问问 AI 小助手</view>
        <view class="ask-tip">输入你想分析的消费问题</view>
        <textarea class="ask-textarea" v-model="assistantQuestion" :focus="assistantInputFocus" maxlength="120" placeholder="比如：本月哪里花得最多？" />
        <view class="ask-actions">
          <button class="ask-cancel" @click="closeAssistantAsk">取消</button>
          <button class="ask-submit" :disabled="answering" @click="submitAssistantAsk">让小人分析</button>
        </view>
      </view>
    </view>

    <view class="input-bar">
      <view class="input-box" :class="focused ? 'focus' : ''">
        <input class="question-input" v-model="question" :focus="inputFocus" placeholder="输入问题，或点击小人打开提问框" confirm-type="send" @focus="focused = true" @blur="handleInputBlur" @confirm="ask" />
      </view>
      <button class="send-btn" :disabled="answering" @click="ask">发送</button>
    </view>
  </view>
</template>

<script>
import { getBills, getBudget, saveBills } from '../../utils/storage.js'
import { formatDate } from '../../utils/date.js'
import { requestQwenAi } from '../../utils/ai.js'

export default {
  data() {
    return {
      question: '',
      answer: '',
      answering: false,
      focused: false,
      inputFocus: false,
      assistantAction: 'idle',
      assistantX: 260,
      assistantY: 300,
      assistantScale: 1,
      dragging: false,
      hasDragged: false,
      dragStartX: 0,
      dragStartY: 0,
      originX: 0,
      originY: 0,
      showAssistantAsk: false,
      assistantQuestion: '',
      assistantInputFocus: false,
      quickQuestions: [
        { icon: 'TOP', text: '本月哪里花得最多？', action: 'point' },
        { icon: '险', text: '有没有超预算风险？', action: 'warn' },
        { icon: '省', text: '给我三条省钱建议', action: 'note' },
        { icon: '减', text: '哪些消费可以减少？', action: 'thinking' }
      ]
    }
  },
  computed: {
    assistantStyle() {
      return `left: ${this.assistantX}px; top: ${this.assistantY}px; transform: scale(${this.assistantScale});`
    }
  },
  mounted() {
    this.initAssistantPosition()
  },
  onShow() {
    const autoQuestion = uni.getStorageSync('xiaozhangling_ai_autorun')
    if (!autoQuestion) return
    uni.removeStorageSync('xiaozhangling_ai_autorun')
    this.question = autoQuestion
    this.setAssistantAction('warn')
    this.$nextTick(() => this.ask())
  },
  methods: {
    initAssistantPosition() {
      const info = uni.getSystemInfoSync()
      this.assistantX = Math.max(10, info.windowWidth - 180)
      this.assistantY = Math.max(160, Math.round(info.windowHeight * 0.45))
    },
    fillQuestion(item) {
      this.question = item.text
      this.setAssistantAction(this.resolveQuickAction(item.text))
      this.$nextTick(() => this.ask())
    },
    focusInput() {
      this.inputFocus = false
      this.$nextTick(() => {
        this.inputFocus = true
        this.focused = true
      })
    },
    handleInputBlur() {
      this.focused = false
      this.inputFocus = false
    },
    setAssistantAction(action) {
      this.assistantAction = action
    },
    handleAssistantTap() {
      if (this.hasDragged) {
        this.hasDragged = false
        return
      }
      this.openAssistantAsk()
    },
    openAssistantAsk() {
      this.assistantQuestion = this.question || ''
      this.showAssistantAsk = true
      this.assistantInputFocus = false
      this.$nextTick(() => {
        this.assistantInputFocus = true
      })
    },
    closeAssistantAsk() {
      this.showAssistantAsk = false
      this.assistantInputFocus = false
    },
    submitAssistantAsk() {
      const text = this.assistantQuestion.trim()
      if (!text) {
        uni.showToast({ title: '请输入问题', icon: 'none' })
        return
      }
      this.question = text
      this.closeAssistantAsk()
      this.ask()
    },
    toggleScale() {
      this.assistantScale = this.assistantScale > 1 ? 1 : 1.18
    },
    startTouch(e) {
      const touch = e.touches && e.touches[0]
      if (touch) this.startDrag({ clientX: touch.clientX, clientY: touch.clientY })
    },
    moveTouch(e) {
      const touch = e.touches && e.touches[0]
      if (touch) this.moveDrag({ clientX: touch.clientX, clientY: touch.clientY })
    },
    startDrag(e) {
      this.dragging = true
      this.hasDragged = false
      this.dragStartX = e.clientX
      this.dragStartY = e.clientY
      this.originX = this.assistantX
      this.originY = this.assistantY
    },
    moveDrag(e) {
      if (!this.dragging) return
      const info = uni.getSystemInfoSync()
      const nextX = this.originX + e.clientX - this.dragStartX
      const nextY = this.originY + e.clientY - this.dragStartY
      if (Math.abs(e.clientX - this.dragStartX) > 6 || Math.abs(e.clientY - this.dragStartY) > 6) {
        this.hasDragged = true
      }
      this.assistantX = Math.min(Math.max(-38, nextX), info.windowWidth - 58)
      this.assistantY = Math.min(Math.max(0, nextY), info.windowHeight - 72)
    },
    endDrag() {
      this.dragging = false
    },
    parseNaturalBill(text) {
      if (!/(记一笔|记账|花了|收入|支出)/.test(text)) return null
      const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(元|块|块钱)?/)
      if (!amountMatch) return null

      const categories = ['餐饮', '购物', '交通', '娱乐', '学习', '医疗', '工资', '兼职', '红包', '理财', '其他']
      const category = categories.find(item => text.includes(item)) || '其他'
      const type = /(收入|工资|兼职|红包|理财)/.test(text) ? 'income' : 'expense'
      const amount = Number(amountMatch[1])
      const billDate = text.includes('昨天') ? formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000)) : formatDate()
      const remark = text
        .replace(/记一笔|记账|收入|支出|花了|消费|今天|昨天|早上|上午|中午|下午|晚上|元|块钱|块/g, '')
        .replace(category, '')
        .replace(amountMatch[1], '')
        .trim() || category

      return {
        id: `ai-${Date.now()}`,
        type,
        amount,
        category,
        date: billDate,
        remark,
        createTime: Date.now(),
        updateTime: Date.now()
      }
    },
    saveNaturalBill(question) {
      const bill = this.parseNaturalBill(question)
      if (!bill) return false

      const bills = getBills()
      saveBills([bill, ...bills])
      this.answer = `已帮你记录完成：${bill.date}，${bill.category}${bill.type === 'income' ? '收入' : '支出'} ${bill.amount.toFixed(2)} 元，备注：${bill.remark}。`
      this.setAssistantAction('ok')
      uni.showToast({ title: '记账成功', icon: 'success' })
      return true
    },
    resolveQuickAction(question) {
      if (question.includes('哪里花得最多')) return 'point'
      if (question.includes('超预算')) {
        const bills = getBills()
        const budget = getBudget()
        const month = formatDate().slice(0, 7)
        const expense = bills.filter(item => item.type === 'expense' && item.date && item.date.startsWith(month)).reduce((sum, item) => sum + Number(item.amount || 0), 0)
        return expense > Number(budget.total || 0) ? 'warn' : 'thumbs'
      }
      if (question.includes('省钱建议')) return 'note'
      return 'thinking'
    },
    async ask() {
      const question = this.question.trim()
      if (!question) {
        uni.showToast({ title: '请输入问题', icon: 'none' })
        return
      }
      if (this.answering) return

      if (this.saveNaturalBill(question)) return

      this.answer = ''
      this.answering = true
      this.setAssistantAction(this.resolveQuickAction(question))
      uni.showLoading({ title: 'AI 思考中...' })
      try {
        const res = await requestQwenAi({ question, bills: getBills(), budget: getBudget() }, (delta, fullContent) => {
          this.answer = fullContent
          uni.hideLoading()
        })
        if (!this.answer) {
          this.answer = `${res.summary} ${res.suggestions.join('')}`
        }
      } catch {
        this.answer = 'AI 回答失败，请稍后重试'
        this.setAssistantAction('warn')
      } finally {
        this.answering = false
        if (this.assistantAction !== 'warn') this.setAssistantAction('idle')
        uni.hideLoading()
      }
    }
  }
}
</script>

<style scoped>
.ai-page {
  min-height: 100vh;
  padding-bottom: 138rpx;
  background: #f4f7fb;
  box-sizing: border-box;
}

.blue-header {
  padding: 34rpx 30rpx 28rpx;
  background: linear-gradient(135deg, #4080ff, #2970ff);
  color: #fff;
}

.hero-copy {
  margin-bottom: 0;
}

.page-title {
  font-size: 38rpx;
  font-weight: 800;
}

.assistant-stage {
  position: fixed;
  z-index: 30;
  width: 96px;
  height: 120px;
  transform-origin: center;
  transform-style: preserve-3d;
  perspective: 260px;
  transition: transform .2s ease;
}

.gauss-glow {
  position: absolute;
  left: 10rpx;
  top: 24rpx;
  width: 148rpx;
  height: 132rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,.76), rgba(147,197,253,.28), rgba(255,255,255,0));
  filter: blur(4rpx);
  animation: pulse 2.6s ease-in-out infinite;
}

.mini-person {
  position: absolute;
  left: 45rpx;
  top: 36rpx;
  width: 78rpx;
  height: 116rpx;
  animation: floatPerson 2.8s ease-in-out infinite;
}

.person-head {
  position: absolute;
  left: 12rpx;
  top: 0;
  width: 54rpx;
  height: 50rpx;
  border-radius: 16rpx;
  background: linear-gradient(145deg, #f0f9ff, #67e8f9);
  box-shadow: inset -8rpx -8rpx 14rpx rgba(37,99,235,.18), 0 4rpx 12rpx rgba(64, 128, 255, .08);
}

.eye { position: absolute; top: 18rpx; width: 7rpx; height: 10rpx; border-radius: 50%; background: #0f172a; }
.eye.left { left: 16rpx; }
.eye.right { right: 16rpx; }

.smile {
  position: absolute;
  left: 20rpx;
  bottom: 10rpx;
  width: 14rpx;
  height: 7rpx;
  border-bottom: 3rpx solid #0f172a;
  border-radius: 0 0 16rpx 16rpx;
}

.person-body {
  position: absolute;
  left: 18rpx;
  top: 50rpx;
  width: 42rpx;
  height: 52rpx;
  border-radius: 16rpx;
  background: #4080ff;
  box-shadow: 0 4rpx 12rpx rgba(64, 128, 255, .08);
}

.person-arm {
  position: absolute;
  top: 62rpx;
  width: 14rpx;
  height: 38rpx;
  border-radius: 999rpx;
  background: #7dd3fc;
  transition: transform .25s ease;
}

.arm-left { left: 6rpx; transform: rotate(18deg); }
.arm-right { right: 6rpx; transform: rotate(-18deg); }

.paper {
  position: absolute;
  right: -16rpx;
  top: 68rpx;
  width: 26rpx;
  height: 34rpx;
  border-radius: 6rpx;
  background: #fff;
  opacity: 0;
  transform: translateY(12rpx);
  transition: all .25s ease;
}

.cocoon-shell {
  position: absolute;
  top: 42rpx;
  width: 36rpx;
  height: 90rpx;
  border-radius: 16rpx;
  background: linear-gradient(150deg, rgba(255,255,255,.72), rgba(255,255,255,.2));
  box-shadow: inset 0 0 20rpx rgba(255,255,255,.36);
}

.shell-left { left: 22rpx; transform: rotate(-22deg); transform-origin: right bottom; }
.shell-right { right: 22rpx; transform: rotate(22deg); transform-origin: left bottom; }

.assistant-stage.thinking .shell-left,
.assistant-stage.warn .shell-left,
.assistant-stage.point .shell-left { animation: shellLeft 1.3s ease-in-out infinite; }
.assistant-stage.thinking .shell-right,
.assistant-stage.warn .shell-right,
.assistant-stage.point .shell-right { animation: shellRight 1.3s ease-in-out infinite; }
.assistant-stage.point .arm-right { transform: rotate(-86deg) translateY(-10rpx); }
.assistant-stage.thumbs .arm-right { transform: rotate(-132deg) translateY(-16rpx); }
.assistant-stage.warn .smile { border-bottom: 0; border-top: 3rpx solid #0f172a; border-radius: 16rpx 16rpx 0 0; }
.assistant-stage.note .paper { opacity: 1; transform: translateY(0); }
.assistant-stage.ok .arm-left { transform: rotate(86deg) translateY(-12rpx); }
.assistant-stage.ok .arm-right { transform: rotate(-86deg) translateY(-12rpx); }

.content-scroll {
  margin-top: -12rpx;
  padding: 0 24rpx 34rpx;
  box-sizing: border-box;
}

.answer-card,
.quick-card {
  margin-bottom: 24rpx;
  padding: 28rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 4rpx 12rpx rgba(64, 128, 255, .08);
  animation: fadeUp .35s ease both;
}

.quick-card { animation-delay: .08s; }

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.section-title { font-size: 32rpx; font-weight: 800; color: #111; }
.section-sub { margin-top: 8rpx; color: #999; font-size: 24rpx; }

.status-pill {
  height: 46rpx;
  line-height: 46rpx;
  padding: 0 22rpx;
  border-radius: 16rpx;
  background: #eef5ff;
  color: #4080ff;
  font-size: 24rpx;
  font-weight: 700;
}

.answer-bubble {
  margin-top: 24rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  color: #334155;
  font-size: 28rpx;
  line-height: 1.7;
  white-space: pre-wrap;
  transition: opacity .2s ease;
}

.answer-bubble.empty { color: #94a3b8; }
.section-head.compact { align-items: center; }
.section-sub.no-margin { margin-top: 0; }

.quick-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-top: 22rpx;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 14rpx;
  min-height: 88rpx;
  padding: 18rpx;
  border-radius: 16rpx;
  background: #eef5ff;
  color: #334155;
  box-sizing: border-box;
  animation: fadeUp .32s ease both;
  transition: transform .16s ease, background .16s ease;
}

.quick-item:active,
.send-btn:active { transform: scale(.96); }

.quick-icon {
  flex: 0 0 auto;
  width: 54rpx;
  height: 46rpx;
  line-height: 46rpx;
  text-align: center;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #4080ff, #2970ff);
  color: #fff;
  font-size: 20rpx;
  font-weight: 800;
}

.quick-text { flex: 1; min-width: 0; font-size: 24rpx; line-height: 1.35; }

.input-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 18rpx 24rpx 28rpx;
  background: #fff;
  box-shadow: 0 -4rpx 12rpx rgba(64, 128, 255, .08);
  box-sizing: border-box;
}

.input-box {
  flex: 1;
  height: 78rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  border-radius: 16rpx;
  background: #f4f7fb;
  box-shadow: inset 0 0 0 0 rgba(64, 128, 255, 0);
  transition: box-shadow .18s ease, background .18s ease;
}

.input-box.focus {
  background: #fff;
  box-shadow: inset 0 0 0 2rpx rgba(64, 128, 255, .32);
}

.question-input { flex: 1; height: 78rpx; color: #111; font-size: 28rpx; }

.ask-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  background: rgba(15, 23, 42, .34);
  box-sizing: border-box;
}

.ask-panel {
  width: 100%;
  padding: 30rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 16rpx 48rpx rgba(15, 23, 42, .16);
  box-sizing: border-box;
  animation: fadeUp .22s ease both;
}

.ask-title {
  color: #111;
  font-size: 34rpx;
  font-weight: 800;
}

.ask-tip {
  margin-top: 8rpx;
  color: #94a3b8;
  font-size: 24rpx;
}

.ask-textarea {
  width: 100%;
  height: 180rpx;
  margin-top: 24rpx;
  padding: 22rpx;
  border-radius: 16rpx;
  background: #f4f7fb;
  color: #111;
  font-size: 28rpx;
  line-height: 1.5;
  box-sizing: border-box;
}

.ask-actions {
  display: flex;
  gap: 18rpx;
  margin-top: 24rpx;
}

.ask-cancel,
.ask-submit {
  flex: 1;
  height: 78rpx;
  line-height: 78rpx;
  margin: 0;
  border-radius: 16rpx;
  font-size: 28rpx;
}

.ask-cancel {
  background: #eef5ff;
  color: #4080ff;
}

.ask-submit {
  background: linear-gradient(135deg, #4080ff, #2970ff);
  color: #fff;
}

.ask-submit[disabled] { background: #aecdf6; color: #fff; }

.send-btn {
  width: 126rpx;
  height: 78rpx;
  line-height: 78rpx;
  margin: 0;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #4080ff, #2970ff);
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
  transition: transform .16s ease;
}

.send-btn[disabled] { background: #aecdf6; color: #fff; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(18rpx); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%, 100% { transform: scale(.96); opacity: .82; } 50% { transform: scale(1.08); opacity: 1; } }
@keyframes floatPerson { 0%, 100% { transform: translateY(0) rotateY(-8deg); } 50% { transform: translateY(-10rpx) rotateY(10deg); } }
@keyframes shellLeft { 0%, 100% { transform: rotate(-22deg) translateX(0); } 50% { transform: rotate(-34deg) translateX(-6rpx); } }
@keyframes shellRight { 0%, 100% { transform: rotate(22deg) translateX(0); } 50% { transform: rotate(34deg) translateX(6rpx); } }
</style>
