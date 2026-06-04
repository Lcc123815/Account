<template>
  <view class="account-card card">
    <view class="label">{{ label }}</view>
    <view class="amount" :class="type">¥{{ Number(value || 0).toFixed(2) }}</view>
    <view v-if="desc" class="muted">{{ desc }}</view>
  </view>
</template>

<script>
export default {
  props: {
    label: String,
    value: [Number, String],
    desc: String,
    type: { type: String, default: '' }
  }
}
</script>

<style scoped>
.account-card { flex: 1; min-width: 0; }
.label { font-size: 24rpx; color: #64748b; }
.amount { margin-top: 12rpx; font-size: 36rpx; font-weight: 800; color: #172554; }
.amount.income { color: #10b981; }
.amount.expense { color: #ef4444; }
</style>
