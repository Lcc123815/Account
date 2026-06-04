<template>
  <view class="bubble" :class="status">{{ text }}</view>
</template>

<script>
export default {
  props: {
    text: { type: String, default: '今天也要好好记账哦！' },
    status: { type: String, default: 'normal' }
  }
}
</script>

<style scoped>
.bubble { pointer-events: none; position: fixed; right: 28rpx; bottom: 310rpx; z-index: 18; max-width: 430rpx; padding: 22rpx 26rpx; border-radius: 26rpx 26rpx 8rpx 26rpx; background: #fff; color: #334155; font-size: 24rpx; box-shadow: 0 16rpx 36rpx rgba(30, 64, 175, .16); }
.bubble.warning { color: #a16207; background: #fffbeb; }
.bubble.danger { color: #b91c1c; background: #fef2f2; }
.bubble.happy { color: #047857; background: #ecfdf5; }
</style>
