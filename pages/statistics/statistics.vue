<template>
  <view class="statistics-page">
    <view class="blue-header">
      <view class="header-top">
        <picker mode="date" fields="month" :value="selectedMonth" @change="changeMonth">
          <view class="month">{{ monthText }} 📅</view>
        </picker>
        <view class="type-tabs">
          <view class="type-tab" :class="activeType === 'expense' ? 'active' : ''" @click="switchType('expense')">支出</view>
          <view class="type-tab" :class="activeType === 'income' ? 'active' : ''" @click="switchType('income')">入账</view>
        </view>
      </view>
      <view class="header-label">{{ activeType === 'expense' ? '共支出' : '共入账' }}</view>
      <view class="header-money">¥{{ totalMoney }}</view>
    </view>

    <scroll-view scroll-y :show-scrollbar="false" class="content-scroll">
      <view class="section-card">
        <view class="section-title">{{ activeType === 'expense' ? '支出构成' : '入账构成' }}</view>
        <view ref="pieChart" class="chart pie-chart"></view>
        <view class="category-list">
          <view v-for="item in currentPieData" :key="item.name" class="category-item">
            <view class="cat-icon">{{ item.name.slice(0, 1) }}</view>
            <view class="cat-name">{{ item.name }}</view>
            <view class="cat-progress"><view class="cat-progress-inner" :style="{ width: item.percent + '%' }"></view></view>
            <view class="cat-money">{{ item.value }} ></view>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">每日对比</view>
        <view ref="dailyChart" class="chart bar-chart"></view>
      </view>

      <view class="section-card">
        <view class="section-title">月度对比</view>
        <view ref="monthChart" class="chart bar-chart"></view>
      </view>

      <view class="section-card rank-card">
        <view class="section-title">{{ selectedMonth.slice(5, 7) }}月{{ activeType === 'expense' ? '支出' : '入账' }}排行</view>
        <view v-for="item in visibleRankList" :key="item.id" class="rank-item">
          <view class="rank-no">{{ item.id }}</view>
          <view class="rank-icon">{{ item.icon }}</view>
          <view class="rank-main">
            <view class="rank-name">{{ item.name }}</view>
            <view class="rank-remark">{{ item.remark }}</view>
            <view class="rank-date">{{ item.date }}</view>
          </view>
          <view class="rank-money" :class="activeType">{{ activeType === 'expense' ? '-' : '+' }}{{ item.amount }}</view>
        </view>
        <view class="all-rank" @click="rankExpanded = !rankExpanded">{{ rankExpanded ? '收起排行' : '全部排行' }} ></view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import * as echarts from 'echarts'

export default {
  data() {
    return {
      activeType: 'expense',
      selectedMonth: '2026-06',
      pieChart: null,
      dailyChart: null,
      monthChart: null,
      rankExpanded: false,
      expensePieData: [
        { name: '其他', value: 581.70, percent: 68.43 },
        { name: '购物', value: 154.50, percent: 18.18 },
        { name: '转账', value: 77.00, percent: 9.06 },
        { name: '餐饮', value: 26.84, percent: 3.16 },
        { name: '教育', value: 10.00, percent: 1.17 }
      ],
      incomePieData: [
        { name: '工资', value: 5200.00, percent: 82.54 },
        { name: '兼职', value: 600.00, percent: 9.52 },
        { name: '红包', value: 300.00, percent: 4.76 },
        { name: '理财', value: 200.00, percent: 3.18 }
      ],
      expenseDailyData: [42.5, 66.8, 23.4, 80.9, 16.2, 130.4, 58.6, 91.2, 26.84, 154.5, 77, 35, 48, 20.6, 44.3],
      incomeDailyData: [0, 5200, 0, 0, 0, 300, 0, 0, 100, 0, 0, 200, 0, 0, 500],
      expenseMonthData: [1067.91, 1460.65, 1722.22, 1214.02, 1025.74, 850.04],
      incomeMonthData: [5200, 5400, 5000, 5600, 5100, 6300],
      expenseRankList: [
        { id: 1, icon: '其', name: '其他', remark: '日常消费', date: '06月15日 15:44', amount: '581.70' },
        { id: 2, icon: '购', name: '购物', remark: '生活用品', date: '06月12日 14:26', amount: '154.50' },
        { id: 3, icon: '转', name: '转账', remark: '朋友转账', date: '06月08日 19:20', amount: '77.00' },
        { id: 4, icon: '餐', name: '餐饮', remark: '午餐外卖', date: '06月06日 12:18', amount: '26.84' },
        { id: 5, icon: '教', name: '教育', remark: '学习资料', date: '06月03日 21:10', amount: '10.00' },
        { id: 6, icon: '交', name: '交通', remark: '地铁出行', date: '06月02日 08:24', amount: '8.50' }
      ],
      incomeRankList: [
        { id: 1, icon: '薪', name: '工资', remark: '本月工资', date: '06月02日 09:00', amount: '5200.00' },
        { id: 2, icon: '兼', name: '兼职', remark: '周末兼职', date: '06月06日 16:35', amount: '600.00' },
        { id: 3, icon: '红', name: '红包', remark: '好友红包', date: '06月15日 20:10', amount: '300.00' },
        { id: 4, icon: '理', name: '理财', remark: '基金收益', date: '06月18日 10:30', amount: '200.00' },
        { id: 5, icon: '奖', name: '奖金', remark: '项目奖励', date: '06月20日 18:20', amount: '180.00' },
        { id: 6, icon: '退', name: '退款', remark: '购物退款', date: '06月22日 13:12', amount: '68.00' }
      ]
    }
  },
  computed: {
    monthText() {
      const [year, month] = this.selectedMonth.split('-')
      return `${year}年${Number(month)}月`
    },
    currentPieData() { return this.activeType === 'expense' ? this.expensePieData : this.incomePieData },
    currentDailyData() { return this.activeType === 'expense' ? this.expenseDailyData : this.incomeDailyData },
    currentMonthData() { return this.activeType === 'expense' ? this.expenseMonthData : this.incomeMonthData },
    currentRankList() { return this.activeType === 'expense' ? this.expenseRankList : this.incomeRankList },
    visibleRankList() { return this.rankExpanded ? this.currentRankList : this.currentRankList.slice(0, 3) },
    totalMoney() {
      const total = this.currentPieData.reduce((sum, item) => sum + Number(item.value), 0)
      return total.toFixed(2)
    }
  },
  mounted() { this.$nextTick(this.renderCharts) },
  beforeDestroy() {
    if (this.pieChart) this.pieChart.dispose()
    if (this.dailyChart) this.dailyChart.dispose()
    if (this.monthChart) this.monthChart.dispose()
  },
  methods: {
    switchType(type) {
      this.activeType = type
      this.rankExpanded = false
      this.$nextTick(this.renderCharts)
    },
    changeMonth(e) {
      this.selectedMonth = e.detail.value
      this.rankExpanded = false
      this.$nextTick(this.renderCharts)
    },
    chartEl(ref) {
      const target = this.$refs[ref]
      return target && (target.$el || target)
    },
    renderCharts() {
      this.renderPie()
      this.renderDaily()
      this.renderMonth()
    },
    renderPie() {
      const el = this.chartEl('pieChart')
      if (!el) return
      if (!this.pieChart) this.pieChart = echarts.init(el)
      const colors = ['#4f8fe8', '#6fa5ee', '#8bb8f2', '#aecdf6', '#d6e7fb']
      this.pieChart.setOption({
        color: colors,
        tooltip: { trigger: 'item', formatter: '{b}<br/>¥{c} ({d}%)' },
        series: [{
          type: 'pie',
          radius: ['46%', '66%'],
          center: ['50%', '48%'],
          data: this.currentPieData,
          label: { color: '#333', formatter: '{b}\n{d}%' },
          labelLine: { length: 16, length2: 12 }
        }]
      }, true)
    },
    renderDaily() {
      const el = this.chartEl('dailyChart')
      if (!el) return
      if (!this.dailyChart) this.dailyChart = echarts.init(el)
      const days = this.currentDailyData.map((_, i) => `${i + 1}日`)
      const label = this.activeType === 'expense' ? '共支出' : '共入账'
      this.dailyChart.setOption({
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#111',
          borderWidth: 0,
          textStyle: { color: '#fff' },
          formatter: params => `${params[0].axisValue}${label}¥${params[0].value}`
        },
        grid: { left: 8, right: 8, top: 22, bottom: 24, containLabel: true },
        xAxis: { type: 'category', data: days, axisLine: { show: false }, axisTick: { show: false } },
        yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#eeeeee' } } },
        series: [{ type: 'bar', data: this.currentDailyData, barWidth: 10, itemStyle: { color: '#4f8fe8', borderRadius: [8, 8, 0, 0] } }]
      }, true)
    },
    renderMonth() {
      const el = this.chartEl('monthChart')
      if (!el) return
      if (!this.monthChart) this.monthChart = echarts.init(el)
      this.monthChart.setOption({
        grid: { left: 8, right: 8, top: 34, bottom: 24, containLabel: true },
        xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'], axisLine: { show: false }, axisTick: { show: false } },
        yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#eeeeee' } } },
        series: [{
          type: 'bar',
          data: this.currentMonthData.map((value, index) => ({ value, itemStyle: { color: index === 5 ? '#4f8fe8' : '#aecdf6' } })),
          barWidth: 18,
          label: { show: true, position: 'top', color: '#555', fontSize: 10 },
          itemStyle: { borderRadius: [8, 8, 0, 0] }
        }]
      }, true)
    }
  }
}
</script>

<style scoped>
.statistics-page { min-height: 100vh; background: #f4f7fb; }
.blue-header { padding: 34rpx 30rpx 44rpx; background: #4f8fe8; color: #fff; }
.statistics-page.income .blue-header { background: #f2a35e; }
.header-top { display: flex; align-items: center; justify-content: space-between; }
.month { font-size: 30rpx; font-weight: 700; }
.type-tabs { display: flex; gap: 12rpx; }
.type-tab { height: 54rpx; line-height: 54rpx; padding: 0 28rpx; border-radius: 999rpx; background: #fff; color: #4f8fe8; font-size: 24rpx; }
.type-tab.active { background: rgba(0, 0, 0, .16); color: #fff; }
.statistics-page.income .type-tab { color: #f2a35e; }
.statistics-page.income .type-tab.active { color: #fff; }
.header-label { margin-top: 44rpx; font-size: 24rpx; opacity: .88; }
.header-money { margin-top: 8rpx; font-size: 58rpx; font-weight: 800; }
.content-scroll { height: calc(100vh - 250rpx); margin-top: -22rpx; padding: 0 24rpx 40rpx; box-sizing: border-box; scrollbar-width: none; }
.content-scroll ::-webkit-scrollbar { width: 0; height: 0; display: none; }
.section-card { margin-bottom: 24rpx; padding: 28rpx; border-radius: 28rpx; background: #fff; }
.section-title { font-size: 32rpx; font-weight: 800; color: #111; }
.chart { width: 100%; }
.pie-chart { height: 520rpx; }
.bar-chart { height: 430rpx; }
.category-list { margin-top: 8rpx; }
.category-item { display: flex; align-items: center; gap: 18rpx; padding: 18rpx 0; }
.cat-icon { width: 50rpx; height: 50rpx; line-height: 50rpx; text-align: center; border-radius: 50%; background: #e8f4ff; color: #2f80ed; font-size: 24rpx; font-weight: 700; }
.cat-name { width: 80rpx; color: #111; font-size: 26rpx; }
.cat-progress { flex: 1; height: 14rpx; border-radius: 999rpx; background: #edf3fb; overflow: hidden; }
.cat-progress-inner { height: 100%; border-radius: 999rpx; background: linear-gradient(90deg, #0b66d8, #91c3ff); }
.cat-money { width: 130rpx; text-align: right; color: #333; font-size: 24rpx; }
.rank-card { padding-bottom: 18rpx; }
.rank-item { display: flex; align-items: center; padding: 24rpx 0; border-bottom: 1rpx solid #eeeeee; }
.rank-no { width: 38rpx; color: #999; font-size: 26rpx; }
.rank-icon { width: 56rpx; height: 56rpx; line-height: 56rpx; margin: 0 20rpx; text-align: center; border-radius: 50%; background: #4f8fe8; color: #fff; font-size: 24rpx; }
.statistics-page.income .rank-icon { background: #f2a35e; }
.rank-main { flex: 1; min-width: 0; }
.rank-name { color: #111; font-size: 28rpx; font-weight: 700; }
.rank-remark { margin-top: 6rpx; color: #555; font-size: 24rpx; }
.rank-date { margin-top: 6rpx; color: #999; font-size: 22rpx; }
.rank-money { color: #111; font-size: 28rpx; font-weight: 700; }
.all-rank { padding-top: 26rpx; text-align: center; color: #4f8fe8; font-size: 26rpx; }
.statistics-page.income .all-rank { color: #f2a35e; }
</style>
