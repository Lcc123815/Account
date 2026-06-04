<template>
  <view class="progress-wrap">
    <view class="progress-head">
      <text>{{ label }}</text>
      <text>{{ percent }}%</text>
    </view>
    <view class="bar">
      <view class="inner" :class="status" :style="{ width: Math.min(percent, 100) + '%' }"></view>
    </view>
    <view class="muted">已用 ¥{{ used.toFixed(2) }} / 预算 ¥{{ total.toFixed(2) }}</view>
  </view>
</template>

<script>
export default {
  props: {
    label: { type: String, default: '预算进度' },
    used: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  computed: {
    percent() { return this.total ? Math.round(this.used / this.total * 100) : 0 },
    status() { return this.percent >= 100 ? 'danger' : this.percent >= 80 ? 'warning' : 'normal' }
  }
}
</script>

<style scoped>
.progress-wrap { margin-top: 22rpx; }
.progress-head { display: flex; justify-content: space-between; font-size: 26rpx; font-weight: 700; color: #334155; }
.bar { height: 18rpx; margin: 16rpx 0; border-radius: 999rpx; background: #e2e8f0; overflow: hidden; }
.inner { height: 100%; border-radius: 999rpx; background: linear-gradient(90deg, #14b8a6, #3b82f6); }
.inner.warning { background: linear-gradient(90deg, #f59e0b, #facc15); }
.inner.danger { background: linear-gradient(90deg, #ef4444, #fb7185); }
</style>
