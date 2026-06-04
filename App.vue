<script>
export default {
  onLaunch() {
    console.log('小账灵启动')
  }
}
</script>

<style>
page {
  min-height: 100%;
  background: #f5f8ff;
  color: #1f2937;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
view, text, input, button, picker {
  box-sizing: border-box;
}
.container {
  min-height: 100vh;
  padding: 28rpx;
  padding-bottom: 150rpx;
  background: linear-gradient(180deg, #eef7ff 0%, #f8fbff 42%, #ffffff 100%);
}
.card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 28rpx;
  padding: 28rpx;
  box-shadow: 0 18rpx 45rpx rgba(39, 91, 158, 0.1);
}
.title {
  font-size: 38rpx;
  font-weight: 800;
  color: #172554;
}
.sub-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #334155;
}
.muted {
  color: #64748b;
  font-size: 24rpx;
}
.primary-btn {
  border: 0;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #19c6b6, #3b82f6);
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}
.danger {
  color: #ef4444;
}
.success {
  color: #10b981;
}
</style>
