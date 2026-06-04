<template>
  <view class="container">
    <!-- ✅ 修复1：添加页面滚动控制，弹窗打开时禁止页面滚动 -->
    <view class="page-content" :style="{ overflow: editing || nicknameEditing ? 'hidden' : 'auto' }">
      <view class="profile card">
        <image v-if="profile.avatarUrl" class="avatar-img" :src="profile.avatarUrl" mode="aspectFill" @click="chooseAvatar" />
        <view v-else class="avatar" @click="chooseAvatar">{{ profile.avatarText }}</view>
        <view class="profile-info">
          <view class="title" @click="editNickname">{{ profile.nickname }}</view>
          <view class="muted">{{ profile.desc }}</view>
        </view>
        <view class="edit-btn" @click="openEdit">编辑</view>
      </view>

      <view class="card menu">
        <view class="menu-item" @click="goBill">
          <text>账单明细</text>
          <text class="arrow">›</text>
        </view>
        <view class="menu-item" @click="goStatistics">
          <text>统计记录</text>
          <text class="arrow">›</text>
        </view>
        <view class="menu-item" @click="goBudget">
          <text>预算设置</text>
          <text class="arrow">›</text>
        </view>
        <view class="menu-item" @click="goAi">
          <text>AI 消费分析</text>
          <text class="arrow">›</text>
        </view>
        <view class="menu-item" @click="designRole">
          <text>3D角色设计</text>
          <text class="arrow">›</text>
        </view>
        <view class="menu-item" @click="logout">
          <text>退出登录</text>
          <text class="arrow">›</text>
        </view>
        <view class="menu-item" @click="clearData">
          <text class="danger">清空本地账单</text>
          <text class="arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 编辑资料弹窗 -->
    <view v-if="editing" class="modal-mask" @click="closeEditModal">
      <view class="modal-panel" @click.stop>
        <view class="modal-title">编辑资料</view>
        <!-- ✅ 修复2：添加always-embed="true"，强制使用WebView内渲染，彻底解决原生覆盖层bug -->
        <!-- ✅ 修复3：显式指定type="text"，避免小程序默认类型异常 -->
        <input 
          class="input" 
          v-model="form.avatarText" 
          type="text"
          maxlength="2" 
          placeholder="头像文字，如 账"
          always-embed="true"
          confirm-type="next"
        />
        <input 
          class="input" 
          v-model="form.nickname" 
          type="text"
          placeholder="昵称"
          always-embed="true"
          confirm-type="next"
        />
        <input 
          class="input" 
          v-model="form.desc" 
          type="text"
          placeholder="个性签名"
          always-embed="true"
          confirm-type="done"
        />
        <view class="edit-actions">
          <view class="btn cancel" @click="closeEditModal">取消</view>
          <view class="btn primary-btn" @click="saveProfile">保存</view>
        </view>
      </view>
    </view>

    <!-- 修改昵称弹窗 -->
    <view v-if="nicknameEditing" class="modal-mask" @click="closeNicknameModal">
      <view class="nickname-panel" @click.stop>
        <view class="modal-title">修改昵称</view>
        <view class="modal-desc">设置一个好记的名字，方便识别你的账户。</view>
        <input 
          class="input nickname-input" 
          v-model="nicknameForm" 
          type="text"
          :focus="nicknameInputFocus" 
          placeholder="请输入昵称"
          always-embed="true"
          confirm-type="done"
        />
        <view class="edit-actions">
          <view class="btn cancel" @click="closeNicknameModal">取消</view>
          <view class="btn primary-btn" @click="saveNickname">完成</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { saveBills } from '../../utils/storage.js'

const PROFILE_KEY = 'xiaozhangling_profile'
const defaultProfile = {
  avatarText: '账',
  avatarUrl: '',
  nickname: '我的',
  desc: '小账灵个人中心'
}

export default {
  data() {
    return {
      editing: false,
      nicknameEditing: false,
      nicknameForm: '',
      nicknameInputFocus: false,
      profile: { ...defaultProfile },
      // ✅ 修复4：确保form对象的所有属性都显式初始化，避免v-model响应式丢失
      form: {
        avatarText: '账',
        avatarUrl: '',
        nickname: '我的',
        desc: '小账灵个人中心'
      }
    }
  },
  onShow() {
    this.loadProfile()
  },
  methods: {
    loadProfile() {
      const savedProfile = uni.getStorageSync(PROFILE_KEY) || {}
      this.profile = { ...defaultProfile, ...savedProfile }
      // 同步初始化form数据，避免打开弹窗时数据不一致
      this.form = { ...this.profile }
    },
    saveProfileData(profile) {
      this.profile = { ...defaultProfile, ...profile }
      uni.setStorageSync(PROFILE_KEY, this.profile)
    },
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album'],
        success: res => {
          this.saveProfileData({ ...this.profile, avatarUrl: res.tempFilePaths[0] })
          uni.showToast({ title: '头像已更新' })
        }
      })
    },
    editNickname() {
      this.nicknameForm = this.profile.nickname
      this.nicknameEditing = true
      // 延迟聚焦，兼容小程序渲染延迟
      setTimeout(() => {
        this.nicknameInputFocus = true
      }, 150)
    },
    saveNickname() {
      const nickname = (this.nicknameForm || '').trim() || '我的'
      this.saveProfileData({ ...this.profile, nickname })
      this.closeNicknameModal()
      uni.showToast({ title: '昵称已更新' })
    },
    openEdit() {
      this.form = { ...this.profile }
      this.editing = true
    },
    closeEditModal() {
      this.editing = false
      this.form = { ...this.profile }
      // 强制收回键盘，避免键盘残留
      uni.hideKeyboard()
    },
    closeNicknameModal() {
      this.nicknameEditing = false
      this.nicknameInputFocus = false
      this.nicknameForm = this.profile.nickname
      uni.hideKeyboard()
    },
    saveProfile() {
      const profile = {
        ...this.profile,
        avatarText: (this.form.avatarText || '账').slice(0, 2),
        nickname: this.form.nickname || '我的',
        desc: this.form.desc || '小账灵个人中心'
      }
      this.saveProfileData(profile)
      this.closeEditModal()
      uni.showToast({ title: '资料已保存' })
    },
    goBill() { uni.switchTab({ url: '/pages/bill/bill' }) },
    goStatistics() { uni.switchTab({ url: '/pages/statistics/statistics' }) },
    goBudget() { uni.navigateTo({ url: '/pages/budget/budget' }) },
    goAi() { uni.switchTab({ url: '/pages/ai/ai' }) },
    designRole() {
      uni.showModal({
        title: '3D角色设计',
        content: '当前版本使用几何体拼接小账灵，支持拖拽、预算状态表情和光效切换。后续可替换 static/models/assistant.glb 模型。',
        showCancel: false
      })
    },
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '当前为本地演示账号，确定退出登录吗？',
        success: res => {
          if (res.confirm) {
            uni.showToast({ title: '已退出登录', icon: 'none' })
          }
        }
      })
    },
    clearData() {
      uni.showModal({
        title: '清空数据',
        content: '确定清空所有本地账单吗？',
        success: res => {
          if (res.confirm) {
            saveBills([])
            uni.showToast({ title: '已清空' })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 120rpx;
}
.page-content {
  width: 100%;
  min-height: 100vh;
}
.profile { 
  display: flex; 
  align-items: center; 
  gap: 24rpx; 
  padding: 32rpx;
  margin: 24rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
}
.profile-info { flex: 1; min-width: 0; }
.avatar,
.avatar-img { width: 108rpx; height: 108rpx; border-radius: 50%; }
.avatar { 
  line-height: 108rpx; 
  text-align: center; 
  color: #fff; 
  font-size: 42rpx; 
  font-weight: 800; 
  background: #2f80ed; 
}
.avatar-img { display: block; background: #e8f4ff; }
.title { 
  display: inline-block; 
  font-size: 34rpx; 
  font-weight: 800; 
  color: #111827; 
  margin-bottom: 8rpx;
}
.muted {
  font-size: 26rpx;
  color: #64748b;
}
.edit-btn { 
  width: 112rpx; 
  height: 56rpx; 
  line-height: 56rpx; 
  text-align: center;
  border: 1rpx solid #d9e8ff; 
  border-radius: 999rpx; 
  background: #f5f9ff; 
  color: #2f80ed; 
  font-size: 24rpx; 
  font-weight: 600; 
  box-shadow: 0 8rpx 20rpx rgba(47, 128, 237, .08);
  transition: all 0.2s;
}
.edit-btn:active {
  opacity: 0.8;
  transform: scale(0.95);
}
.modal-mask { 
  position: fixed; 
  left: 0; 
  top: 0; 
  right: 0; 
  bottom: 0; 
  z-index: 9999; /* ✅ 修复5：提高弹窗层级，确保在所有元素之上 */
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 40rpx; 
  background: rgba(15, 23, 42, .42);
}
.modal-panel,
.nickname-panel { 
  width: 100%; 
  max-width: 640rpx; 
  padding: 32rpx; 
  border-radius: 28rpx; 
  background: #fff; 
  box-shadow: 0 30rpx 80rpx rgba(15, 23, 42, .18);
  /* ✅ 修复6：绝对禁止给弹窗父元素添加transform属性，这是小程序输入框bug的头号元凶 */
}
.nickname-panel { max-width: 600rpx; padding: 36rpx; }
.modal-title { 
  font-size: 32rpx; 
  font-weight: 800; 
  color: #172554; 
  margin-bottom: 20rpx;
}
.modal-desc { 
  margin-top: 10rpx; 
  color: #94a3b8; 
  font-size: 24rpx; 
}
.input { 
  width: 100%;
  box-sizing: border-box;
  height: 88rpx; /* ✅ 修复7：显式设置输入框高度，解决iOS光标偏移和无法点击 */
  line-height: 88rpx;
  margin-top: 18rpx; 
  padding: 0 22rpx; /* ✅ 修复8：改用左右padding，避免上下padding导致的高度计算错误 */
  border-radius: 18rpx; 
  background: #f1f5f9; 
  color: #334155; 
  font-size: 28rpx;
  border: none;
  outline: none;
}
.nickname-input { 
  margin-top: 28rpx; 
  background: #f7f9fc; 
  border: 1rpx solid #e2e8f0; 
}
.edit-actions { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 18rpx; 
  margin-top: 32rpx; 
}
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
.cancel { background: #f1f5f9; color: #64748b; }
.primary-btn { 
  background: linear-gradient(90deg, #2dd4bf, #3b82f6); 
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(59, 130, 246, 0.2);
}
.menu { 
  margin: 24rpx; 
  padding: 0 32rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
}
.menu-item { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 28rpx 0; 
  border-bottom: 1rpx solid #e2e8f0; 
  font-size: 30rpx; 
  color: #334155; 
}
.menu-item:last-child { border-bottom: 0; }
.arrow { color: #94a3b8; font-size: 42rpx; }
.danger { color: #dc2626; }
</style>