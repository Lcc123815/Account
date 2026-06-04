<template>
  <view class="form card">
    <view class="type-row">
      <view class="type" :class="form.type === 'expense' ? 'active expense' : ''" @click="setType('expense')">支出</view>
      <view class="type" :class="form.type === 'income' ? 'active income' : ''" @click="setType('income')">收入</view>
    </view>
    <input class="input" type="digit" :value="form.amount" placeholder="金额" @input="form.amount = $event.detail.value" />
    <picker :range="categories" @change="onCategoryChange">
      <view class="input">分类：{{ form.category }}</view>
    </picker>
    <picker mode="date" :value="form.date" @change="form.date = $event.detail.value">
      <view class="input">日期：{{ form.date }}</view>
    </picker>
    <input class="input" :value="form.remark" placeholder="备注，如午餐、兼职" @input="form.remark = $event.detail.value" />
    <button class="primary-btn" @click="submit">{{ editId ? '保存修改' : '添加记录' }}</button>
  </view>
</template>

<script>
import { expenseCategories, incomeCategories, today } from '../../utils/bill.js'

export default {
  props: { value: Object },
  data() {
    return {
      form: { type: 'expense', amount: '', category: '餐饮', date: today(), remark: '' },
      editId: ''
    }
  },
  computed: {
    categories() { return this.form.type === 'income' ? incomeCategories : expenseCategories }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        if (val && val.id) {
          this.editId = val.id
          this.form = { ...val }
        }
      }
    }
  },
  methods: {
    setType(type) {
      this.form.type = type
      this.form.category = type === 'income' ? incomeCategories[0] : expenseCategories[0]
    },
    onCategoryChange(e) {
      this.form.category = this.categories[e.detail.value]
    },
    submit() {
      if (!Number(this.form.amount)) {
        uni.showToast({ title: '请输入金额', icon: 'none' })
        return
      }
      this.$emit('submit', { ...this.form, id: this.editId })
      this.editId = ''
      this.form = { type: 'expense', amount: '', category: '餐饮', date: today(), remark: '' }
    }
  }
}
</script>

<style scoped>
.form { margin-top: 24rpx; }
.type-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18rpx; margin-bottom: 20rpx; }
.type { text-align: center; padding: 20rpx; border-radius: 20rpx; background: #eef2ff; color: #475569; font-weight: 700; }
.type.active { color: #fff; }
.type.expense { background: #ef4444; }
.type.income { background: #10b981; }
.input { margin: 18rpx 0; padding: 22rpx 24rpx; border-radius: 18rpx; background: #f1f5f9; color: #334155; font-size: 28rpx; }
button { margin-top: 18rpx; }
</style>
