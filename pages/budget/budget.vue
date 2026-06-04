<template>
  <view class="container">
    <view class="title">预算设置</view>
    
    <view class="card form-card">
      <view class="sub-title">月度总预算</view>
      <!-- ✅ 修复1：改用v-model + always-embed + 显式type -->
      <input 
        class="input" 
        type="digit" 
        v-model.number="budget.total" 
        placeholder="请输入总预算"
        always-embed="true"
        confirm-type="next"
      />
      <BudgetProgress label="本月总预算" :used="expense" :total="Number(budget.total)" />
    </view>

    <view class="card form-card">
      <view class="sub-title">分类预算</view>
      <view v-for="cat in categories" :key="cat" class="cat-row">
        <text>{{ cat }}</text>
        <!-- ✅ 修复2：给所有分类输入框添加always-embed -->
        <input 
          type="digit" 
          v-model.number="budget.categories[cat]" 
          always-embed="true"
          confirm-type="next"
          placeholder="0"
        />
      </view>
      <!-- ✅ 修复3：把原生button改为view，避免样式冲突 -->
      <view class="btn primary-btn" @click="save">保存预算</view>
    </view>

    <view class="card form-card">
      <view class="sub-title">超预算分类</view>
      <view v-for="item in overCategories" :key="item.name" class="warn-row">
        <text>{{ item.name }}</text>
        <text>已用 ¥{{ item.used.toFixed(2) }} / ¥{{ item.total.toFixed(2) }}</text>
      </view>
      <view v-if="!overCategories.length" class="muted">暂无超预算分类</view>
    </view>
  </view>
</template>

<script>
import BudgetProgress from '../../components/BudgetProgress/BudgetProgress.vue'
import { getBudget, saveBudget, getBills } from '../../utils/storage.js'
import { expenseCategories } from '../../utils/bill.js'
import { monthBills, sumByType, categorySummary } from '../../utils/statistics.js'

export default {
  components: { BudgetProgress },
  data() { 
    return { 
      budget: this.initBudget(), // ✅ 修复4：初始化时确保所有分类都有默认值
      bills: [], 
      categories: expenseCategories 
    } 
  },
  onShow() { 
    this.budget = this.initBudget()
    this.bills = getBills() 
  },
  computed: {
    expense() { return sumByType(monthBills(this.bills), 'expense') },
    overCategories() {
      const summary = categorySummary(monthBills(this.bills), 'expense')
      return summary.map(item => ({ 
        name: item.name, 
        used: item.value, 
        total: Number(this.budget.categories[item.name] || 0) 
      }))
      .filter(item => item.total && item.used > item.total)
    }
  },
  methods: {
    // ✅ 修复5：关键！确保budget.categories包含所有分类的键，解决响应式丢失问题
    initBudget() {
      const savedBudget = getBudget() || {}
      const defaultCategories = {}
      
      // 为每个分类初始化默认值0，确保Vue能检测到属性变化
      expenseCategories.forEach(cat => {
        defaultCategories[cat] = savedBudget.categories?.[cat] || 0
      })
      
      return {
        total: savedBudget.total || 0,
        categories: defaultCategories
      }
    },
    save() {
      // 确保所有值都是数字类型
      this.budget.total = Number(this.budget.total || 0)
      Object.keys(this.budget.categories).forEach(k => {
        this.budget.categories[k] = Number(this.budget.categories[k] || 0)
      })
      
      saveBudget(this.budget)
      uni.showToast({ title: '预算已保存' })
      
      if (this.expense > this.budget.total && this.budget.total > 0) {
        uni.showModal({ 
          title: '超额预警', 
          content: '本月总支出已超过预算。', 
          showCancel: false 
        })
      } else if (this.budget.total && this.expense / this.budget.total >= 0.8) {
        uni.showModal({ 
          title: '接近预算', 
          content: '本月预算使用已超过 80%。', 
          showCancel: false 
        })
      }
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24rpx;
  padding-bottom: 120rpx;
}
.title {
  font-size: 36rpx;
  font-weight: 800;
  color: #111827;
  margin-bottom: 24rpx;
}
.form-card { 
  margin-top: 24rpx; 
  padding: 32rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
}
.sub-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16rpx;
}
/* ✅ 修复6：显式设置输入框高度和line-height，解决iOS点击问题 */
.input { 
  width: 100%;
  box-sizing: border-box;
  height: 88rpx;
  line-height: 88rpx;
  margin-top: 20rpx; 
  padding: 0 22rpx; 
  border-radius: 18rpx; 
  background: #f1f5f9;
  color: #334155;
  font-size: 28rpx;
  border: none;
  outline: none;
}
.cat-row { 
  display: grid; 
  grid-template-columns: 150rpx 1fr; 
  align-items: center; 
  gap: 18rpx; 
  margin-top: 18rpx; 
  color: #334155; 
}
.cat-row input { 
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 18rpx; 
  border-radius: 16rpx; 
  background: #f1f5f9;
  font-size: 26rpx;
}
/* ✅ 修复7：自定义按钮样式，替代原生button */
.btn {
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.2s;
}
.btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}
.primary-btn { 
  margin-top: 26rpx;
  background: linear-gradient(90deg, #2dd4bf, #3b82f6); 
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(59, 130, 246, 0.2);
}
.warn-row { 
  display: flex; 
  justify-content: space-between; 
  padding: 18rpx 0; 
  color: #ef4444; 
  border-bottom: 1rpx solid #fee2e2; 
  font-size: 24rpx; 
}
.muted {
  color: #94a3b8;
  font-size: 26rpx;
  text-align: center;
  padding: 32rpx 0;
}
</style>