<template>
  <view class="bill-item card">
    <view>
      <view class="top"><text class="tag" :class="bill.type">{{ bill.type === 'income' ? '收入' : '支出' }}</text><text class="cat">{{ bill.category }}</text></view>
      <view class="muted">{{ bill.date }} {{ bill.remark }}</view>
    </view>
    <view class="right">
      <view class="money" :class="bill.type">{{ bill.type === 'income' ? '+' : '-' }}¥{{ bill.amount.toFixed(2) }}</view>
      <view class="ops"><text @click="$emit('edit', bill)">编辑</text><text @click="$emit('delete', bill)">删除</text></view>
    </view>
  </view>
</template>

<script>
export default { props: { bill: { type: Object, required: true } } }
</script>

<style scoped>
.bill-item { display: flex; justify-content: space-between; align-items: center; margin-top: 18rpx; }
.top { display: flex; align-items: center; gap: 14rpx; }
.tag { padding: 6rpx 14rpx; border-radius: 999rpx; font-size: 22rpx; color: #fff; background: #ef4444; }
.tag.income { background: #10b981; }
.cat { font-size: 30rpx; font-weight: 700; color: #334155; }
.right { text-align: right; }
.money { font-size: 30rpx; font-weight: 800; color: #ef4444; }
.money.income { color: #10b981; }
.ops { margin-top: 12rpx; display: flex; gap: 20rpx; justify-content: flex-end; color: #2563eb; font-size: 24rpx; }
</style>
