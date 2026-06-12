<template>
  <view class="budget-page">
    <view class="budget-card">
      <view class="budget-head">
        <view>
          <view class="budget-title">总预算使用</view>
          <view class="budget-sub">已用 ¥{{ monthExpense }} / 预算 ¥{{ budgetTotal }}</view>
        </view>
        <view class="percent">{{ budgetPercent }}%</view>
      </view>
    </view>

    <view class="tab-row">
      <view class="tab" :class="activeType === 'expense' ? 'active' : ''" @click="switchType('expense')">支出</view>
      <view class="tab" :class="activeType === 'income' ? 'active' : ''" @click="switchType('income')">收入</view>
    </view>

    <view class="form-card">
      <view class="form-row">
        <text class="label">金额</text>
        <input class="field" :value="amount" placeholder="请输入金额" @input="amount = $event.detail.value" />
      </view>

      <view class="form-row">
        <text class="label">分类</text>
        <picker class="field-picker" :range="currentCategories" :value="categoryIndex" @change="changeCategory">
          <view class="field text-field">{{ currentCategories[categoryIndex] }}</view>
        </picker>
      </view>

      <view class="form-row date-row">
        <text class="label">日期</text>
        <picker class="field-picker" mode="date" :value="date" @change="changeDate">
          <view class="field text-field">{{ date }}</view>
        </picker>
      </view>

      <view class="form-row">
        <text class="label">备注</text>
        <input class="field" :value="remark" placeholder="如午餐、兼职" @input="remark = $event.detail.value" />
      </view>

      <button class="submit-btn" @click="addRecord">{{ activeType === 'income' ? '添加收入' : '添加记录' }}</button>
    </view>

    <view class="float-face" @click="showBalanceToast">😊</view>
  </view>
</template>

<script>
import { getBills, saveBills, getBudget } from '../../utils/storage.js'
import { formatDate } from '../../utils/date.js'

export default {
  data() {
    return {
      activeType: 'expense',
      amount: '',
      remark: '',
      date: formatDate(),
      categoryIndex: 0,
      bills: [],
      budget: getBudget(),
      expenseCategories: ['餐饮', '购物', '交通', '娱乐', '学习', '其他'],
      incomeCategories: ['工资', '兼职', '红包', '理财', '其他']
    }
  },
  computed: {
    currentCategories() {
      return this.activeType === 'income' ? this.incomeCategories : this.expenseCategories
    },
    currentMonth() {
      return formatDate().slice(0, 7)
    },
    monthExpense() {
      const total = this.bills
        .filter(item => item.type === 'expense' && item.date && item.date.startsWith(this.currentMonth))
        .reduce((sum, item) => sum + Number(item.amount || 0), 0)
      return total.toFixed(2)
    },
    budgetTotal() {
      return Number(this.budget.total || 0).toFixed(2)
    },
    budgetPercent() {
      const budget = Number(this.budget.total || 0)
      if (!budget) return 0
      return Math.min(999, Math.round((Number(this.monthExpense) / budget) * 100))
    }
  },
  onShow() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.bills = getBills()
      this.budget = getBudget()
    },
    switchType(type) {
      this.activeType = type
      this.categoryIndex = 0
    },
    changeCategory(e) {
      this.categoryIndex = Number(e.detail.value)
    },
    changeDate(e) {
      this.date = e.detail.value
    },
    addRecord() {
      const amount = Number(this.amount)
      if (!amount || amount <= 0) {
        uni.showToast({ title: '请输入有效金额', icon: 'none' })
        return
      }

      const now = Date.now()
      const record = {
        id: `bill-${now}`,
        type: this.activeType,
        amount,
        category: this.currentCategories[this.categoryIndex],
        date: this.date,
        remark: this.remark.trim() || this.currentCategories[this.categoryIndex],
        createTime: now,
        updateTime: now
      }

      const bills = [record, ...getBills()]
      saveBills(bills)
      this.bills = bills
      this.amount = ''
      this.remark = ''
      uni.showToast({ title: this.activeType === 'income' ? '收入已添加' : '记录已添加', icon: 'success' })
      this.checkOverBudget(record)
    },
    checkOverBudget(record) {
      if (record.type !== 'expense') return
      const budget = Number(this.budget.total || 0)
      if (!budget || Number(this.monthExpense) <= budget) return

      uni.showModal({
        title: '预算超支提醒',
        content: '本月支出已超过预算，要问问 AI 怎么调整吗？',
        confirmText: '问问 AI',
        cancelText: '稍后再说',
        success: (res) => {
          if (res.confirm) {
            uni.setStorageSync('xiaozhangling_ai_autorun', '有没有超预算风险？请帮我分析并给出调整建议。')
            uni.switchTab({ url: '/pages/ai/ai' })
          }
        }
      })
    },
    showBalanceToast() {
      uni.showToast({ title: '本月结余不错，继续保持！', icon: 'none' })
    }
  }
}
</script>

<style scoped>
.budget-page {
  min-height: 100vh;
  padding: 28rpx;
  padding-bottom: 140rpx;
  background: #f4f7fb;
  box-sizing: border-box;
}

.budget-card {
  padding: 30rpx;
  border-radius: 26rpx;
  background: #fff;
  box-shadow: 0 12rpx 34rpx rgba(47, 128, 237, 0.08);
}

.budget-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.budget-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #111;
}

.budget-sub {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #999;
}

.percent {
  font-size: 34rpx;
  font-weight: 700;
  color: #2f80ed;
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
  border: 2rpx solid #2f80ed;
  background: #fff;
  color: #2f80ed;
  font-weight: 700;
}

.form-card {
  padding: 10rpx 28rpx 32rpx;
  border-radius: 26rpx;
  background: #fff;
  box-shadow: 0 12rpx 34rpx rgba(47, 128, 237, 0.08);
}

.form-row {
  position: relative;
  display: flex;
  align-items: center;
  padding: 22rpx 0;
  border-bottom: 1rpx solid #eeeeee;
}

.form-row:last-of-type {
  border-bottom: 0;
}

.label {
  width: 110rpx;
  font-size: 28rpx;
  color: #111;
}

.field,
.field-picker {
  flex: 1;
  height: 64rpx;
}

.field {
  width: 100%;
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 22rpx;
  border-radius: 18rpx;
  background: #f4f7fb;
  color: #111;
  font-size: 28rpx;
  box-sizing: border-box;
}

.text-field {
  color: #111;
}

.date-row {
  overflow: visible;
}

.submit-btn {
  height: 88rpx;
  line-height: 88rpx;
  margin-top: 46rpx;
  border: 0;
  border-radius: 999rpx;
  background: #2f80ed;
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
}

.float-face {
  position: fixed;
  right: 34rpx;
  bottom: 150rpx;
  width: 76rpx;
  height: 76rpx;
  line-height: 76rpx;
  text-align: center;
  border-radius: 50%;
  background: #e8f4ff;
  font-size: 38rpx;
  box-shadow: 0 12rpx 30rpx rgba(47, 128, 237, 0.18);
}
</style>
