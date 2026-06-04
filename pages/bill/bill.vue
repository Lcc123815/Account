<template>
  <view class="bill-page">
    <view class="filter-row">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input class="search-input" :value="keyword" placeholder="查找交易" @input="keyword = $event.detail.value" />
      </view>
      <picker :range="typeOptions" @change="typeIndex = $event.detail.value">
        <view class="type-select">{{ typeOptions[typeIndex] }}</view>
      </picker>
    </view>

    <view class="summary-row">
      <picker :range="monthOptions" @change="monthIndex = $event.detail.value">
        <view class="month-select">{{ monthOptions[monthIndex] }}</view>
      </picker>
      <view class="summary-money">
        <text class="expense-text">支出¥{{ expenseTotal }}</text>
        <text class="income-text">收入¥{{ incomeTotal }}</text>
      </view>
    </view>

    <scroll-view scroll-y :show-scrollbar="false" class="bill-list">
      <view v-for="item in filteredBills" :key="item.id" class="bill-card">
        <view class="avatar" :class="item.type">{{ item.icon }}</view>
        <view class="bill-main">
          <view class="bill-name">{{ item.name }}</view>
          <view class="bill-time">{{ item.time }}</view>
          <view v-if="item.note" class="bill-note">{{ item.note }}</view>
        </view>
        <view class="amount" :class="item.type">{{ item.type === 'income' ? '+' : '-' }}{{ item.amount }}</view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      keyword: '',
      typeIndex: 0,
      monthIndex: 0,
      typeOptions: ['全部账单', '收入账单', '支出账单'],
      monthOptions: ['2026年6月', '2026年5月', '2026年4月'],
      bills: [
        { id: 1, type: 'expense', icon: '餐', name: '早餐', time: '06月01日 08:12', amount: '12.00', note: '外卖偏多' },
        { id: 2, type: 'income', icon: '薪', name: '工资收入', time: '06月01日 09:00', amount: '5200.00' },
        { id: 3, type: 'expense', icon: '购', name: '生活用品', time: '06月02日 14:26', amount: '86.50' },
        { id: 4, type: 'expense', icon: '交', name: '地铁出行', time: '06月03日 18:40', amount: '6.00' },
        { id: 5, type: 'expense', icon: '娱', name: '电影票', time: '06月04日 20:10', amount: '39.90', note: '非必要消费' },
        { id: 6, type: 'income', icon: '兼', name: '兼职收入', time: '06月06日 16:35', amount: '300.00' },
        { id: 7, type: 'expense', icon: '学', name: '学习资料', time: '06月08日 10:18', amount: '128.00' },
        { id: 8, type: 'expense', icon: '医', name: '药品', time: '06月10日 11:20', amount: '35.00' },
        { id: 9, type: 'expense', icon: '餐', name: '晚餐', time: '06月12日 19:03', amount: '48.00' },
        { id: 10, type: 'expense', icon: '购', name: '衣物购买', time: '06月15日 15:44', amount: '260.00', note: '超出日常预算' }
      ]
    }
  },
  computed: {
    filteredBills() {
      return this.bills.filter(item => {
        const typeOk = this.typeIndex === 0 || (this.typeIndex === 1 && item.type === 'income') || (this.typeIndex === 2 && item.type === 'expense')
        const keyOk = !this.keyword || item.name.includes(this.keyword)
        return typeOk && keyOk
      })
    },
    expenseTotal() {
      return this.bills.filter(i => i.type === 'expense').reduce((s, i) => s + Number(i.amount), 0).toFixed(2)
    },
    incomeTotal() {
      return this.bills.filter(i => i.type === 'income').reduce((s, i) => s + Number(i.amount), 0).toFixed(2)
    }
  }
}
</script>

<style scoped>
.bill-page { min-height: 100vh; background: #f5f5f5; padding-bottom: 30rpx; }
.filter-row { display: grid; grid-template-columns: 1fr 170rpx; gap: 18rpx; align-items: center; padding: 20rpx 24rpx; background: #fff; }
.type-select { text-align: right; font-size: 28rpx; color: #111; }
.search-box { height: 64rpx; display: flex; align-items: center; padding: 0 20rpx; border-radius: 999rpx; background: #f1f1f1; }
.search-icon { margin-right: 10rpx; font-size: 24rpx; color: #999; }
.search-input { flex: 1; height: 64rpx; font-size: 26rpx; }
.stat-btn { text-align: right; font-size: 28rpx; color: #111; }
.summary-row { display: flex; justify-content: space-between; align-items: center; padding: 24rpx; background: #f5f5f5; }
.month-select { font-size: 30rpx; font-weight: 700; color: #111; }
.summary-money { display: flex; gap: 22rpx; font-size: 24rpx; }
.expense-text { color: #000; }
.income-text { color: #ff9900; }
.bill-list { height: calc(100vh - 150rpx); padding: 0 24rpx; box-sizing: border-box; scrollbar-width: none; }
.bill-list ::-webkit-scrollbar { width: 0; height: 0; display: none; }
.bill-card { display: flex; align-items: center; min-height: 122rpx; padding: 22rpx 0; background: #fff; border-bottom: 1rpx solid #eeeeee; }
.avatar { width: 76rpx; height: 76rpx; line-height: 76rpx; margin: 0 22rpx; text-align: center; border-radius: 50%; color: #fff; font-size: 28rpx; font-weight: 700; background: #4f8fe8; }
.avatar.income { background: #f2a35e; }
.bill-main { flex: 1; min-width: 0; }
.bill-name { font-size: 30rpx; color: #111; }
.bill-time { margin-top: 10rpx; font-size: 24rpx; color: #999; }
.bill-note { margin-top: 8rpx; text-align: right; font-size: 22rpx; color: #f03030; }
.amount { width: 170rpx; padding-right: 24rpx; text-align: right; font-size: 30rpx; color: #000; font-weight: 700; }
.amount.income { color: #ff9900; }
</style>